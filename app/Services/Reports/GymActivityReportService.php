<?php

declare(strict_types=1);

namespace App\Services\Reports;

use App\Support\ReportDateRange;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Combines non-member POS sales (transactions) and member check-ins (attendances)
 * into a single "gym activity" feed via a UNION ALL query, so both sources share
 * sorting, filtering, and pagination at the database level.
 */
class GymActivityReportService
{
    private const SORTABLE = ['transaction_date', 'customer_name', 'gym_class', 'amount', 'member_status'];

    /**
     * @param  array{search?: ?string, gym_class_id?: ?int, payment_method?: ?string, member_status?: ?string, date_preset?: ?string, date_from?: ?string, date_to?: ?string}  $filters
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE, true) ? $filters['sort_by'] : 'transaction_date';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return DB::query()
            ->fromSub($this->baseUnionQuery($filters), 'gym_activity')
            ->orderBy($sortBy, $sortDir)
            ->orderBy('transaction_time', $sortDir)
            ->paginate($perPage, ['*'], 'page')
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function summary(array $filters): array
    {
        $todayFilters = array_merge($filters, ['date_preset' => 'today', 'date_from' => null, 'date_to' => null]);

        $todayAgg = DB::query()
            ->fromSub($this->baseUnionQuery($todayFilters), 't')
            ->selectRaw('COUNT(*) as visitors, COALESCE(SUM(amount), 0) as revenue')
            ->first();

        $filteredAgg = DB::query()
            ->fromSub($this->baseUnionQuery($filters), 'f')
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(amount), 0) as revenue, SUM(CASE WHEN amount > 0 THEN 1 ELSE 0 END) as paying_count')
            ->first();

        $topClass = DB::query()
            ->fromSub($this->baseUnionQuery($filters), 'tc')
            ->select('gym_class')
            ->selectRaw('COUNT(*) as total')
            ->whereNotNull('gym_class')
            ->groupBy('gym_class')
            ->orderByDesc('total')
            ->first();

        $payingCount = (int) ($filteredAgg->paying_count ?? 0);
        $totalRevenue = (float) ($filteredAgg->revenue ?? 0);

        return [
            'today_visitors' => (int) ($todayAgg->visitors ?? 0),
            'today_revenue' => (float) ($todayAgg->revenue ?? 0),
            'total_transactions' => (int) ($filteredAgg->total ?? 0),
            'most_popular_class' => $topClass->gym_class ?? '-',
            'average_revenue' => $payingCount > 0 ? round($totalRevenue / $payingCount) : 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array{date: string, visitors: int, revenue: float}>
     */
    public function dailyChart(array $filters): array
    {
        [$from, $to] = $this->resolveChartRange($filters);

        $chartFilters = array_merge($filters, [
            'date_preset' => 'custom',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
        ]);

        $rows = DB::query()
            ->fromSub($this->baseUnionQuery($chartFilters), 'c')
            ->select('transaction_date')
            ->selectRaw('COUNT(*) as visitors, COALESCE(SUM(amount), 0) as revenue')
            ->groupBy('transaction_date')
            ->get()
            ->keyBy(fn ($row) => (string) $row->transaction_date);

        $result = [];
        $cursor = $from->copy();
        while ($cursor->lte($to)) {
            $key = $cursor->toDateString();
            $row = $rows->get($key);
            $result[] = [
                'date' => $cursor->format('d/m'),
                'visitors' => $row ? (int) $row->visitors : 0,
                'revenue' => $row ? (float) $row->revenue : 0,
            ];
            $cursor->addDay();
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array{name: string, value: int}>
     */
    public function topClassesChart(array $filters, int $limit = 5): array
    {
        return DB::query()
            ->fromSub($this->baseUnionQuery($filters), 'tc')
            ->select('gym_class')
            ->selectRaw('COUNT(*) as total')
            ->whereNotNull('gym_class')
            ->groupBy('gym_class')
            ->orderByDesc('total')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => ['name' => $row->gym_class, 'value' => (int) $row->total])
            ->toArray();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, object>
     */
    public function exportRows(array $filters): array
    {
        return DB::query()
            ->fromSub($this->baseUnionQuery($filters), 'gym_activity')
            ->orderByDesc('transaction_date')
            ->orderByDesc('transaction_time')
            ->get()
            ->toArray();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function baseUnionQuery(array $filters): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $gymClassId = $filters['gym_class_id'] ?? null;
        $paymentMethod = $filters['payment_method'] ?? null;
        $memberStatus = $filters['member_status'] ?? null;

        [$from, $to] = ReportDateRange::resolve(
            $filters['date_preset'] ?? null,
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null,
        );

        $transactions = DB::table('transactions')
            ->leftJoin('users as creators', 'transactions.created_by', '=', 'creators.id')
            ->where('transactions.status', 'paid')
            ->whereNull('transactions.deleted_at');

        if ($gymClassId) {
            $transactions->where('transactions.gym_class_id', $gymClassId);
        }
        if ($paymentMethod) {
            $transactions->where('transactions.payment_method', $paymentMethod);
        }
        if ($from) {
            $transactions->where('transactions.created_at', '>=', $from);
        }
        if ($to) {
            $transactions->where('transactions.created_at', '<=', $to);
        }
        if ($search !== '') {
            $transactions->where(function ($q) use ($search) {
                $q->where('transactions.customer_name', 'like', "%{$search}%")
                    ->orWhere('transactions.invoice_number', 'like', "%{$search}%");
            });
        }
        if ($memberStatus === 'member') {
            $transactions->whereRaw('1 = 0');
        }

        $transactions->selectRaw("
            'transaction' as source,
            transactions.uuid as ref_uuid,
            transactions.customer_name as customer_name,
            'non_member' as member_status,
            COALESCE(transactions.class_name, 'Umum') as gym_class,
            transactions.gym_class_id as gym_class_id,
            DATE(transactions.created_at) as transaction_date,
            TIME(transactions.created_at) as transaction_time,
            transactions.payment_method as payment_method,
            transactions.invoice_number as invoice_number,
            transactions.amount as amount,
            creators.name as created_by
        ");

        $attendances = DB::table('attendances')
            ->join('members', 'attendances.member_id', '=', 'members.id')
            ->leftJoin('users as creators', 'attendances.created_by', '=', 'creators.id')
            ->where('attendances.source', 'checkin');

        if ($gymClassId) {
            $attendances->where('attendances.gym_class_id', $gymClassId);
        }
        if ($from) {
            $attendances->where('attendances.checked_in_at', '>=', $from);
        }
        if ($to) {
            $attendances->where('attendances.checked_in_at', '<=', $to);
        }
        if ($search !== '') {
            $attendances->where('members.name', 'like', "%{$search}%");
        }
        // Attendance rows carry no payment/invoice; excluded whenever a payment-method
        // filter is active or the caller explicitly wants non-member rows only.
        if ($paymentMethod || $memberStatus === 'non_member') {
            $attendances->whereRaw('1 = 0');
        }

        $attendances->selectRaw("
            'attendance' as source,
            attendances.uuid as ref_uuid,
            members.name as customer_name,
            'member' as member_status,
            COALESCE(attendances.class_name, 'Umum') as gym_class,
            attendances.gym_class_id as gym_class_id,
            DATE(attendances.checked_in_at) as transaction_date,
            TIME(attendances.checked_in_at) as transaction_time,
            NULL as payment_method,
            NULL as invoice_number,
            0 as amount,
            creators.name as created_by
        ");

        return $transactions->unionAll($attendances);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveChartRange(array $filters): array
    {
        [$from, $to] = ReportDateRange::resolve(
            $filters['date_preset'] ?? null,
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null,
        );

        if (! $from || ! $to) {
            $to = Carbon::today();
            $from = $to->copy()->subDays(13);
        }

        $to = $to->copy()->startOfDay();
        $from = $from->copy()->startOfDay();

        if ($from->diffInDays($to) > 60) {
            $from = $to->copy()->subDays(60);
        }

        return [$from, $to];
    }
}
