<?php

declare(strict_types=1);

namespace App\Services\Reports;

use App\Support\ReportDateRange;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * financial_transactions is the single ledger for all income (pos_sale, membership,
 * studio_booking, training). This service joins back to the source tables purely to resolve
 * display fields (invoice number, customer name) - no UNION needed.
 */
class FinancialReportService
{
    private const CATEGORY_LABELS = [
        'pos_sale' => 'Gym',
        'membership' => 'Membership',
        'studio_booking' => 'Booking',
        'training' => 'Pelatihan',
    ];

    private const SORTABLE = ['transaction_date', 'amount', 'category'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE, true) ? $filters['sort_by'] : 'transaction_date';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $paginator = $this->baseQuery($filters)
            ->orderBy($sortBy, $sortDir)
            ->orderByDesc('ft.created_at')
            ->paginate($perPage, ['*'], 'page')
            ->withQueryString();

        $paginator->getCollection()->transform(fn ($row) => $this->decorate($row));

        return $paginator;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    public function exportRows(array $filters): array
    {
        return $this->baseQuery($filters)
            ->orderByDesc('ft.transaction_date')
            ->get()
            ->map(fn ($row) => $this->decorate($row))
            ->toArray();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function summary(array $filters): array
    {
        $today = Carbon::today();

        $todayIncome = (float) $this->baseQuery(array_merge($filters, ['date_preset' => 'today', 'date_from' => null, 'date_to' => null]))->sum('ft.amount');
        $monthlyIncome = (float) $this->baseQuery(array_merge($filters, ['date_preset' => 'this_month', 'date_from' => null, 'date_to' => null]))->sum('ft.amount');

        $filteredQuery = $this->baseQuery($filters);
        $byMethod = (clone $filteredQuery)
            ->select('ft.payment_method')
            ->selectRaw('COALESCE(SUM(ft.amount), 0) as total')
            ->groupBy('ft.payment_method')
            ->pluck('total', 'payment_method');

        $grandTotal = (float) $this->baseQuery($filters)->sum('ft.amount');

        return [
            'today_income' => $todayIncome,
            'monthly_income' => $monthlyIncome,
            'cash_income' => (float) ($byMethod['cash'] ?? 0),
            'transfer_income' => (float) ($byMethod['transfer'] ?? 0),
            'qris_income' => (float) ($byMethod['qris'] ?? 0),
            'grand_total' => $grandTotal,
        ];
    }

    /**
     * Hari Ini / Minggu Ini / Bulan Ini / Tahun Ini, each with a trend vs the
     * equivalent prior period (kemarin, minggu lalu, bulan lalu, tahun lalu).
     *
     * @return array<string, array{value: float, trend: float}>
     */
    public function periodComparison(): array
    {
        $today = Carbon::today();

        $periods = [
            'today' => [$today->copy(), $today->copy(), $today->copy()->subDay(), $today->copy()->subDay()],
            'this_week' => [$today->copy()->startOfWeek(), $today->copy()->endOfWeek(), $today->copy()->subWeek()->startOfWeek(), $today->copy()->subWeek()->endOfWeek()],
            'this_month' => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth(), $today->copy()->subMonth()->startOfMonth(), $today->copy()->subMonth()->endOfMonth()],
            'this_year' => [$today->copy()->startOfYear(), $today->copy()->endOfYear(), $today->copy()->subYear()->startOfYear(), $today->copy()->subYear()->endOfYear()],
        ];

        $result = [];
        foreach ($periods as $key => [$currentFrom, $currentTo, $prevFrom, $prevTo]) {
            $current = (float) $this->periodSum($currentFrom, $currentTo);
            $previous = (float) $this->periodSum($prevFrom, $prevTo);
            $trend = $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : ($current > 0 ? 100.0 : 0.0);

            $result[$key] = ['value' => $current, 'trend' => $trend];
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array{date: string, revenue: float}>
     */
    public function revenueByDayChart(array $filters): array
    {
        [$from, $to] = $this->resolveChartRange($filters);

        $chartFilters = array_merge($filters, [
            'date_preset' => 'custom',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
        ]);

        $rows = $this->baseQuery($chartFilters)
            ->select('ft.transaction_date')
            ->selectRaw('COALESCE(SUM(ft.amount), 0) as revenue')
            ->groupBy('ft.transaction_date')
            ->get()
            ->keyBy(fn ($r) => (string) $r->transaction_date);

        $result = [];
        $cursor = $from->copy();
        while ($cursor->lte($to)) {
            $key = $cursor->toDateString();
            $row = $rows->get($key);
            $result[] = ['date' => $cursor->format('d/m'), 'revenue' => $row ? (float) $row->revenue : 0];
            $cursor->addDay();
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array{name: string, value: float}>
     */
    public function revenueByCategoryChart(array $filters): array
    {
        return $this->baseQuery($filters)
            ->select('ft.category')
            ->selectRaw('COALESCE(SUM(ft.amount), 0) as total')
            ->groupBy('ft.category')
            ->get()
            ->map(fn ($r) => ['name' => self::CATEGORY_LABELS[$r->category] ?? $r->category, 'value' => (float) $r->total])
            ->toArray();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array{name: string, value: float}>
     */
    public function paymentMethodDistributionChart(array $filters): array
    {
        $labels = ['cash' => 'Cash', 'transfer' => 'Transfer', 'qris' => 'QRIS'];

        return $this->baseQuery($filters)
            ->select('ft.payment_method')
            ->selectRaw('COALESCE(SUM(ft.amount), 0) as total')
            ->groupBy('ft.payment_method')
            ->get()
            ->map(fn ($r) => ['name' => $labels[$r->payment_method] ?? '-', 'value' => (float) $r->total])
            ->toArray();
    }

    /**
     * @return array<int, array{month: string, revenue: float}>
     */
    public function monthlyRevenueChart(): array
    {
        $today = Carbon::today();
        $from = $today->copy()->subMonths(11)->startOfMonth();

        $rows = DB::table('financial_transactions')
            ->where('type', 'income')
            ->where('transaction_date', '>=', $from)
            ->selectRaw("DATE_FORMAT(transaction_date, '%Y-%m') as ym, COALESCE(SUM(amount), 0) as revenue")
            ->groupBy('ym')
            ->get()
            ->keyBy('ym');

        $result = [];
        $cursor = $from->copy();
        for ($i = 0; $i < 12; $i++) {
            $key = $cursor->format('Y-m');
            $row = $rows->get($key);
            $result[] = ['month' => $cursor->translatedFormat('M Y'), 'revenue' => $row ? (float) $row->revenue : 0];
            $cursor->addMonth();
        }

        return $result;
    }

    private function periodSum(Carbon $from, Carbon $to): float
    {
        return (float) DB::table('financial_transactions')
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$from->toDateString(), $to->toDateString()])
            ->sum('amount');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function baseQuery(array $filters): Builder
    {
        $category = $filters['category'] ?? null;
        $paymentMethod = $filters['payment_method'] ?? null;

        [$from, $to] = ReportDateRange::resolve(
            $filters['date_preset'] ?? null,
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null,
        );

        $query = DB::table('financial_transactions as ft')
            ->leftJoin('transactions as t', 'ft.transaction_id', '=', 't.id')
            ->leftJoin('studio_bookings as sb', 'ft.studio_booking_id', '=', 'sb.id')
            ->leftJoin('invoices as inv', 'ft.invoice_id', '=', 'inv.id')
            ->leftJoin('members as m', 'inv.member_id', '=', 'm.id')
            ->leftJoin('training_participants as tp', 'ft.training_participant_id', '=', 'tp.id')
            ->leftJoin('trainings as tr', 'tp.training_id', '=', 'tr.id')
            ->where('ft.type', 'income');

        if ($category) {
            $query->where('ft.category', $category);
        }
        if ($paymentMethod) {
            $query->where('ft.payment_method', $paymentMethod);
        }
        if ($from) {
            $query->where('ft.transaction_date', '>=', $from->toDateString());
        }
        if ($to) {
            $query->where('ft.transaction_date', '<=', $to->toDateString());
        }

        $query->select([
            'ft.id', 'ft.uuid', 'ft.category', 'ft.amount', 'ft.payment_method', 'ft.transaction_date', 'ft.description',
            'ft.transaction_id', 'ft.studio_booking_id', 'ft.invoice_id', 'ft.training_participant_id',
            DB::raw('COALESCE(t.invoice_number, sb.invoice_number, inv.invoice_number, tp.invoice_number) as invoice_number'),
            DB::raw('COALESCE(t.customer_name, sb.customer_name, m.name, tp.full_name) as customer_name'),
            'tr.title as training_title',
        ]);

        return $query;
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
            $from = $to->copy()->subDays(29);
        }

        $to = $to->copy()->startOfDay();
        $from = $from->copy()->startOfDay();

        if ($from->diffInDays($to) > 90) {
            $from = $to->copy()->subDays(90);
        }

        return [$from, $to];
    }

    private function decorate(object $row): array
    {
        return [
            'uuid' => $row->uuid,
            'transaction_date' => $row->transaction_date,
            'invoice_number' => $this->filled($row->invoice_number ?? null) ? (string) $row->invoice_number : '-',
            'category' => $row->category,
            'category_label' => self::CATEGORY_LABELS[$row->category] ?? $row->category,
            'customer_name' => $this->filled($row->customer_name ?? null) ? (string) $row->customer_name : '-',
            'payment_method' => $row->payment_method,
            'amount' => (float) $row->amount,
            'status' => 'Lunas',
        ];
    }

    private function filled(?string $value): bool
    {
        return $value !== null && trim($value) !== '';
    }
}
