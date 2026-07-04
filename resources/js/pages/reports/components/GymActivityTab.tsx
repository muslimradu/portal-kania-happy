import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Download, Users, Wallet, Receipt, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/shared/StatCard';
import SearchInput from '@/components/shared/SearchInput';
import Pagination from '@/components/shared/Pagination';
import DataTable, { type Column } from '@/components/shared/DataTable';
import DateRangeFilter, { type DateRangeValue } from './DateRangeFilter';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateShort, formatTime, PAYMENT_METHOD_LABELS, withQuery } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useInertiaLoading } from '@/hooks/useInertiaLoading';
import type { GymActivityFilters, GymActivityRow, GymActivitySummary, Pagination as PaginationType } from '@/types/reports';

interface GymClassOption {
    id: number;
    name: string;
}

interface GymActivityTabProps {
    data: PaginationType<GymActivityRow>;
    filters: GymActivityFilters;
    summary: GymActivitySummary;
    gymClasses: GymClassOption[];
}

export default function GymActivityTab({ data, filters, summary, gymClasses }: GymActivityTabProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const debouncedSearch = useDebouncedValue(search, 400);
    const isFirstRun = useRef(true);
    const loading = useInertiaLoading();

    const applyFilters = (params: Partial<GymActivityFilters>) => {
        router.get(route('reports.gym-activity.index'), { ...filters, ...params, page: undefined }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        applyFilters({ search: debouncedSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    const handlePageChange = (page: number) => {
        router.get(route('reports.gym-activity.index'), { ...filters, page }, { preserveState: true, replace: true });
    };

    const dateRangeValue: DateRangeValue = {
        preset: (filters.date_preset as DateRangeValue['preset']) ?? '',
        date_from: filters.date_from,
        date_to: filters.date_to,
    };

    const columns: Column<GymActivityRow>[] = [
        {
            key: 'customer_name',
            header: 'Pelanggan',
            sortable: true,
            render: (row) => <span className="font-medium text-gray-900">{row.customer_name}</span>,
        },
        {
            key: 'member_status',
            header: 'Status Member',
            render: (row) => (
                <Badge className="rounded-full text-white" style={{ backgroundColor: row.member_status === 'member' ? 'var(--brand-primary)' : '#9CA3AF' }}>
                    {row.member_status === 'member' ? 'Member' : 'Non Member'}
                </Badge>
            ),
        },
        { key: 'gym_class', header: 'Kelas', sortable: true },
        { key: 'transaction_date', header: 'Tanggal', sortable: true, render: (row) => formatDateShort(row.transaction_date) },
        { key: 'transaction_time', header: 'Jam', render: (row) => formatTime(row.transaction_time) },
        {
            key: 'payment_method',
            header: 'Metode Bayar',
            render: (row) => (row.payment_method ? PAYMENT_METHOD_LABELS[row.payment_method] : '-'),
        },
        { key: 'invoice_number', header: 'No. Invoice', render: (row) => row.invoice_number ?? '-' },
        { key: 'amount', header: 'Jumlah', sortable: true, render: (row) => (row.amount > 0 ? formatCurrency(row.amount) : '-') },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard size="mini" title="Pengunjung Hari Ini" value={summary.today_visitors} icon={Users} />
                <StatCard size="mini" title="Pendapatan Hari Ini" value={formatCurrency(summary.today_revenue)} icon={Wallet} />
                <StatCard size="mini" title="Total Transaksi" value={summary.total_transactions} icon={Receipt} />
                <StatCard size="mini" title="Kelas Terpopuler" value={summary.most_popular_class} icon={Trophy} />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
                <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau invoice..." className="w-full sm:w-64" />
                <select
                    value={filters.gym_class_id ?? ''}
                    onChange={(e) => applyFilters({ gym_class_id: e.target.value || undefined })}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                >
                    <option value="">Semua Kelas</option>
                    {gymClasses.map((gc) => (
                        <option key={gc.id} value={gc.id}>
                            {gc.name}
                        </option>
                    ))}
                </select>
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
                <select
                    value={filters.member_status ?? ''}
                    onChange={(e) => applyFilters({ member_status: e.target.value || undefined })}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                >
                    <option value="">Semua Status</option>
                    <option value="member">Member</option>
                    <option value="non_member">Non Member</option>
                </select>
                <DateRangeFilter
                    value={dateRangeValue}
                    onChange={(v) => applyFilters({ date_preset: v.preset || undefined, date_from: v.date_from, date_to: v.date_to })}
                />
                <div className="flex flex-1 items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => window.open(withQuery(route('reports.gym-activity.export'), filters), '_blank')}
                    >
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={data.data}
                    keyExtractor={(row) => `${row.source}-${row.ref_uuid}`}
                    stickyHeader
                    loading={loading}
                    sortBy={filters.sort_by}
                    sortDir={filters.sort_dir as 'asc' | 'desc'}
                    onSort={handleSort}
                    emptyTitle="Belum ada aktivitas"
                    emptyDescription="Transaksi kasir dan check-in member akan muncul di sini."
                />
                <Pagination
                    currentPage={data.current_page}
                    lastPage={data.last_page}
                    from={data.from}
                    to={data.to}
                    total={data.total}
                    itemLabel="aktivitas"
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
