import { Head, router } from '@inertiajs/react';
import { Download, Wallet, Calendar, CalendarDays, CalendarRange, Banknote, ArrowRightLeft, QrCode, TrendingUp, TrendingDown } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Pagination from '@/components/shared/Pagination';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DateRangeFilter, { type DateRangeValue } from '../reports/components/DateRangeFilter';
import { formatCurrency, formatDateShort, PAYMENT_METHOD_LABELS, withQuery } from '@/lib/format';
import { usePollingReload } from '@/hooks/usePollingReload';
import type { FinancialFilters, FinancialReportRow, FinancialSummary, Pagination as PaginationType, PeriodComparison } from '@/types/reports';

interface Props {
    transactions: PaginationType<FinancialReportRow>;
    filters: FinancialFilters;
    summary: FinancialSummary;
    periodComparison: PeriodComparison;
    gymClasses: Array<{ id: number; name: string }>;
    membershipPackages: Array<{ id: number; name: string }>;
    trainings: Array<{ id: number; title: string }>;
}

const CATEGORY_BADGE: Record<string, string> = {
    pos_sale: '#2563EB',
    membership: '#7C3AED',
    studio_booking: '#F97316',
    training: '#059669',
};

function PeriodCard({ title, icon: Icon, value, trend }: { title: string; icon: typeof Wallet; value: number; trend: number }) {
    const isUp = trend >= 0;
    return (
        <div className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium leading-tight text-gray-500">{title}</p>
                <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)', color: 'var(--brand-primary)' }}
                >
                    <Icon className="h-3.5 w-3.5" />
                </div>
            </div>
            <p className="mt-1.5 text-base font-bold text-gray-900">{formatCurrency(value)}</p>
            <p className={`mt-0.5 flex items-center gap-1 text-[10px] font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}% vs periode sebelumnya
            </p>
        </div>
    );
}

export default function FinancialReportIndex({ transactions, filters, summary, periodComparison, gymClasses, membershipPackages, trainings }: Props) {
    usePollingReload(['transactions', 'summary', 'periodComparison'], 20000);
    const showGymClassFilter = filters.category === 'pos_sale';
    const showMembershipPackageFilter = filters.category === 'membership';
    const showTrainingFilter = filters.category === 'training';

    const applyFilters = (params: Partial<FinancialFilters>) => {
        router.get(route('financial-reports.index'), { ...filters, ...params, page: undefined }, { preserveState: true, replace: true });
    };

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    const handlePageChange = (page: number) => {
        router.get(route('financial-reports.index'), { ...filters, page }, { preserveState: true, replace: true });
    };

    const dateRangeValue: DateRangeValue = {
        preset: (filters.date_preset as DateRangeValue['preset']) ?? '',
        date_from: filters.date_from,
        date_to: filters.date_to,
    };

    const columns: Column<FinancialReportRow>[] = [
        { key: 'transaction_date', header: 'Tanggal', sortable: true, render: (row) => formatDateShort(row.transaction_date) },
        { key: 'invoice_number', header: 'No. Invoice' },
        {
            key: 'category_label',
            header: 'Kategori',
            render: (row) => (
                <Badge className="rounded-full text-white" style={{ backgroundColor: CATEGORY_BADGE[row.category] }}>
                    {row.category_label}
                </Badge>
            ),
        },
        {
            key: 'sub_category',
            header: 'Sub Kategori',
            render: (row) => (
                <span className="block max-w-[10rem] truncate text-gray-700" title={row.sub_category}>
                    {row.sub_category}
                </span>
            ),
        },
        { key: 'customer_name', header: 'Pelanggan', render: (row) => <span className="font-medium text-gray-900">{row.customer_name}</span> },
        { key: 'payment_method', header: 'Metode Bayar', render: (row) => (row.payment_method ? PAYMENT_METHOD_LABELS[row.payment_method] : '-') },
        { key: 'amount', header: 'Jumlah', sortable: true, render: (row) => formatCurrency(row.amount) },
        {
            key: 'status',
            header: 'Status',
            render: () => (
                <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">Lunas</Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumb={[{ label: 'Laporan Keuangan' }]}>
            <Head title="Laporan Keuangan" />

            <div className="space-y-6">
                <PageHeader
                    title="Laporan Keuangan"
                    description="Gabungan pendapatan Kasir, Membership, Booking Sanggar, dan Pelatihan"
                    action={
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => window.open(withQuery(route('financial-reports.export'), filters), '_blank')}
                        >
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    }
                />

                {/* Financial Summary Widget */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <PeriodCard title="Hari Ini" icon={Calendar} value={periodComparison.today.value} trend={periodComparison.today.trend} />
                    <PeriodCard title="Minggu Ini" icon={CalendarDays} value={periodComparison.this_week.value} trend={periodComparison.this_week.trend} />
                    <PeriodCard title="Bulan Ini" icon={CalendarRange} value={periodComparison.this_month.value} trend={periodComparison.this_month.trend} />
                    <PeriodCard title="Tahun Ini" icon={Wallet} value={periodComparison.this_year.value} trend={periodComparison.this_year.trend} />
                </div>

                {/* Payment Method Summary */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <StatCard size="mini" title="Pendapatan Cash" value={formatCurrency(summary.cash_income)} icon={Banknote} color="green" />
                    <StatCard size="mini" title="Pendapatan Transfer" value={formatCurrency(summary.transfer_income)} icon={ArrowRightLeft} color="blue" />
                    <StatCard size="mini" title="Pendapatan QRIS" value={formatCurrency(summary.qris_income)} icon={QrCode} color="orange" />
                    <StatCard size="mini" title="Grand Total" value={formatCurrency(summary.grand_total)} icon={Wallet} />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
                    <select
                        value={filters.category ?? ''}
                        onChange={(e) => {
                            const category = e.target.value || undefined;
                            applyFilters({
                                category,
                                gym_class_id: category === 'pos_sale' ? filters.gym_class_id : undefined,
                                membership_package_id: category === 'membership' ? filters.membership_package_id : undefined,
                                training_id: category === 'training' ? filters.training_id : undefined,
                            });
                        }}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                    >
                        <option value="">Semua Kategori</option>
                        <option value="pos_sale">Gym</option>
                        <option value="membership">Membership</option>
                        <option value="studio_booking">Booking</option>
                        <option value="training">Pelatihan</option>
                    </select>
                    {showGymClassFilter && (
                        <select
                            value={filters.gym_class_id ?? ''}
                            onChange={(e) => applyFilters({ gym_class_id: e.target.value || undefined })}
                            className="max-w-48 truncate rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                            title={gymClasses.find((g) => String(g.id) === filters.gym_class_id)?.name}
                        >
                            <option value="">Semua Jenis Gym</option>
                            {gymClasses.map((gymClass) => (
                                <option key={gymClass.id} value={gymClass.id}>
                                    {gymClass.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {showMembershipPackageFilter && (
                        <select
                            value={filters.membership_package_id ?? ''}
                            onChange={(e) => applyFilters({ membership_package_id: e.target.value || undefined })}
                            className="max-w-48 truncate rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                            title={membershipPackages.find((p) => String(p.id) === filters.membership_package_id)?.name}
                        >
                            <option value="">Semua Paket</option>
                            {membershipPackages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {showTrainingFilter && (
                        <select
                            value={filters.training_id ?? ''}
                            onChange={(e) => applyFilters({ training_id: e.target.value || undefined })}
                            className="max-w-48 truncate rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                            title={trainings.find((t) => String(t.id) === filters.training_id)?.title}
                        >
                            <option value="">Semua Pelatihan</option>
                            {trainings.map((training) => (
                                <option key={training.id} value={training.id}>
                                    {training.title}
                                </option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filters.payment_method ?? ''}
                        onChange={(e) => applyFilters({ payment_method: e.target.value || undefined })}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                    >
                        <option value="">Semua Pembayaran</option>
                        <option value="cash">Cash</option>
                        <option value="transfer">Transfer</option>
                        <option value="qris">QRIS</option>
                    </select>
                    <DateRangeFilter
                        value={dateRangeValue}
                        onChange={(v) => applyFilters({ date_preset: v.preset || undefined, date_from: v.date_from, date_to: v.date_to })}
                    />
                </div>

                {/* Table */}
                <div className="rounded-2xl bg-white shadow-sm">
                    <DataTable
                        columns={columns}
                        data={transactions.data}
                        keyExtractor={(row) => row.uuid}
                        stickyHeader
                        sortBy={filters.sort_by}
                        sortDir={filters.sort_dir as 'asc' | 'desc'}
                        onSort={handleSort}
                        emptyTitle="Belum ada transaksi keuangan"
                        emptyDescription="Transaksi Kasir, Membership, Booking, dan Pelatihan akan muncul di sini."
                    />
                    <Pagination
                        currentPage={transactions.current_page}
                        lastPage={transactions.last_page}
                        from={transactions.from}
                        to={transactions.to}
                        total={transactions.total}
                        itemLabel="transaksi"
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
