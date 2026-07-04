<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Membership;
use App\Models\StudioBooking;
use App\Models\Transaction;
use App\Services\Reports\FinancialReportService;
use App\Services\Reports\GymActivityReportService;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function __construct(
        private readonly StudioBookingService $bookingService,
        private readonly GymActivityReportService $gymActivityReportService,
        private readonly FinancialReportService $financialReportService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function stats(): array
    {
        $this->bookingService->syncStatuses();

        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
        $todayStart = $today->copy()->startOfDay();
        $todayEnd = $today->copy()->endOfDay();

        $todayBookings = StudioBooking::whereDate('booking_date', $today)->where('status', '!=', 'cancelled')->count();
        $monthlyBookings = StudioBooking::whereBetween('booking_date', [$monthStart, $monthEnd])
            ->where('status', '!=', 'cancelled')
            ->count();

        $todayRevenue = FinancialTransaction::whereDate('transaction_date', $today)->where('type', 'income')->sum('amount');
        $monthlyRevenue = FinancialTransaction::whereBetween('transaction_date', [$monthStart, $monthEnd])
            ->where('type', 'income')
            ->sum('amount');

        $expiredMembers = Membership::query()
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('end_date')
            ->where('end_date', '<', $today)
            ->count();

        $newMembersThisMonth = Member::whereBetween('created_at', [$monthStart, $monthEnd])->count();

        $todayVisitors = Attendance::whereBetween('checked_in_at', [$todayStart, $todayEnd])->count()
            + Transaction::where('status', 'paid')->whereBetween('created_at', [$todayStart, $todayEnd])->count();

        return [
            'total_members' => Member::count(),
            'expired_members' => $expiredMembers,
            'today_classes' => $todayVisitors,
            'today_bookings' => $todayBookings,
            'monthly_bookings' => $monthlyBookings,
            'today_revenue' => (float) $todayRevenue,
            'monthly_revenue' => (float) $monthlyRevenue,
            'new_members_this_month' => $newMembersThisMonth,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentActivity(int $limit = 5): array
    {
        return ActivityLog::with('user:id,name')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'uuid' => $log->uuid,
                'module' => $log->module,
                'action' => $log->action,
                'description' => $log->description,
                'user_name' => $log->user?->name ?? 'Sistem',
                'created_at' => $log->created_at,
            ])
            ->toArray();
    }

    /**
     * Members whose active membership expires within the next 7 days - feeds the
     * "Member Hampir Expired" dashboard widget.
     *
     * @return array<int, array<string, mixed>>
     */
    public function upcomingExpiredMembers(int $limit = 5): array
    {
        $today = Carbon::today();

        return Membership::query()
            ->with('member:id,uuid,name')
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [$today, $today->copy()->addDays(7)])
            ->orderBy('end_date')
            ->limit($limit)
            ->get()
            ->map(fn (Membership $m) => [
                'member_uuid' => $m->member?->uuid,
                'member_name' => $m->member?->name ?? '-',
                'package_name' => $m->package_name,
                'end_date' => optional($m->end_date)->toDateString(),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{uuid: string, customer_name: string, booking_date: string, start_time: string, end_time: string, status: string, payment_status: string, price: float}>
     */
    public function recentBookings(int $limit = 5): array
    {
        return StudioBooking::query()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['uuid', 'customer_name', 'booking_date', 'start_time', 'end_time', 'status', 'payment_status', 'price'])
            ->toArray();
    }

    /**
     * @return array<int, array{date: string, revenue: float}>
     */
    public function revenueLast7Days(): array
    {
        $today = Carbon::today();

        return $this->financialReportService->revenueByDayChart([
            'date_preset' => 'custom',
            'date_from' => $today->copy()->subDays(6)->toDateString(),
            'date_to' => $today->toDateString(),
        ]);
    }

    /**
     * @return array<int, array{name: string, value: int}>
     */
    public function topClasses(int $limit = 5): array
    {
        return $this->gymActivityReportService->topClassesChart([], $limit);
    }

    /**
     * @return array<int, array{name: string, value: float}>
     */
    public function paymentDistribution(): array
    {
        return $this->financialReportService->paymentMethodDistributionChart(['date_preset' => 'this_month']);
    }
}
