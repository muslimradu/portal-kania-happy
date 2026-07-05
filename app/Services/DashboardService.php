<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Membership;
use App\Models\StudioBooking;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\Transaction;
use App\Services\Reports\FinancialReportService;
use App\Services\Reports\GymActivityReportService;
use Illuminate\Database\Eloquent\Builder;
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

        $activeTrainings = Training::query()
            ->whereNull('deleted_at')
            ->where('last_training_date', '>=', $today)
            ->count();

        $monthlyTrainingParticipants = TrainingParticipant::query()
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->count();

        $monthlyTrainingRevenue = FinancialTransaction::query()
            ->where('type', 'income')
            ->where('category', 'training')
            ->whereBetween('transaction_date', [$monthStart, $monthEnd])
            ->sum('amount');

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
            'active_trainings' => $activeTrainings,
            'monthly_training_participants' => $monthlyTrainingParticipants,
            'monthly_training_revenue' => (float) $monthlyTrainingRevenue,
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
     * Active and upcoming trainings for the dashboard info widget.
     *
     * @return array<int, array<string, mixed>>
     */
    public function activeTrainings(int $limit = 5): array
    {
        $today = Carbon::today()->toDateString();

        return Training::query()
            ->whereNull('deleted_at')
            ->where('last_training_date', '>=', $today)
            ->withCount([
                'participants as participants_count' => fn (Builder $q) => $q->whereNull('deleted_at'),
                'participants as paid_participants_count' => fn (Builder $q) => $q->whereNull('deleted_at')->where('payment_status', 'paid'),
                'participants as unpaid_participants_count' => fn (Builder $q) => $q->whereNull('deleted_at')->where('payment_status', '!=', 'paid'),
            ])
            ->orderBy('first_training_date')
            ->orderBy('title')
            ->limit($limit)
            ->get()
            ->map(fn (Training $training) => [
                'uuid' => $training->uuid,
                'title' => $training->title,
                'trainer_name' => $training->trainer_name,
                'training_dates' => $training->training_dates,
                'training_location' => $training->training_location,
                'price' => (float) $training->price,
                'status' => $training->computeNaturalStatus(),
                'participants_count' => $training->participants_count,
                'paid_participants_count' => $training->paid_participants_count,
                'unpaid_participants_count' => $training->unpaid_participants_count,
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentTrainingParticipants(int $limit = 5): array
    {
        return TrainingParticipant::query()
            ->with('training:id,uuid,title')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['uuid', 'full_name', 'payment_status', 'training_id', 'created_at'])
            ->map(fn (TrainingParticipant $participant) => [
                'uuid' => $participant->uuid,
                'full_name' => $participant->full_name,
                'payment_status' => $participant->payment_status,
                'training_uuid' => $participant->training?->uuid,
                'training_title' => $participant->training?->title ?? '-',
                'created_at' => $participant->created_at,
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
