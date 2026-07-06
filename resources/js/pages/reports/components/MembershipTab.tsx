import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Download, Users, UserCheck, UserX, AlertTriangle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/shared/StatCard';
import SearchInput from '@/components/shared/SearchInput';
import Pagination from '@/components/shared/Pagination';
import DataTable, { type Column } from '@/components/shared/DataTable';
import DateRangeFilter, { type DateRangeValue } from './DateRangeFilter';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, formatDateTime, withQuery } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useInertiaLoading } from '@/hooks/useInertiaLoading';
import type { MembershipFilters, MembershipReportRow, MembershipSummary, Pagination as PaginationType } from '@/types/reports';

interface MembershipPackageOption {
    id: number;
    name: string;
}

interface MembershipTabProps {
    data: PaginationType<MembershipReportRow>;
    filters: MembershipFilters;
    summary: MembershipSummary;
    membershipPackages: MembershipPackageOption[];
}

const STATUS_STYLE: Record<string, string> = {
    active: '#10B981',
    expired: '#EF4444',
    cancelled: '#9CA3AF',
};

const STATUS_LABEL: Record<string, string> = {
    active: 'Aktif',
    expired: 'Expired',
    cancelled: 'Dibatalkan',
};

export default function MembershipTab({ data, filters, summary, membershipPackages }: MembershipTabProps) {
    const [search, setSearch] = useState(filters.member_search ?? '');
    const debouncedSearch = useDebouncedValue(search, 400);
    const isFirstRun = useRef(true);
    const loading = useInertiaLoading();

    const applyFilters = (params: Partial<MembershipFilters>) => {
        router.get(route('reports.membership.index'), { ...filters, ...params, page: undefined }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        applyFilters({ member_search: debouncedSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSort = (column: string) => {
        const dir = filters.m_sort_by === column && filters.m_sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ m_sort_by: column, m_sort_dir: dir });
    };

    const handlePageChange = (page: number) => {
        router.get(route('reports.membership.index'), { ...filters, page }, { preserveState: true, replace: true });
    };

    const dateRangeValue: DateRangeValue = {
        preset: (filters.m_date_preset as DateRangeValue['preset']) ?? '',
        date_from: filters.m_date_from,
        date_to: filters.m_date_to,
    };

    const columns: Column<MembershipReportRow>[] = [
        {
            key: 'member_name',
            header: 'Nama Member',
            sortable: false,
            render: (row) => <span className="font-medium text-gray-900">{row.member_name}</span>,
        },
        { key: 'member_phone', header: 'No. Telepon' },
        { key: 'package_name', header: 'Paket', sortable: true },
        { key: 'purchase_date', header: 'Tanggal Beli', sortable: true, render: (row) => formatDateShort(row.purchase_date) },
        {
            key: 'activation_date',
            header: 'Tanggal Aktivasi',
            sortable: true,
            render: (row) => (row.activation_date ? formatDateShort(row.activation_date) : 'Belum check-in'),
        },
        {
            key: 'expired_date',
            header: 'Tanggal Berakhir',
            sortable: true,
            render: (row) => {
                if (!row.activation_date) return '-';
                return row.expired_date ? formatDateShort(row.expired_date) : 'Manual';
            },
        },
        {
            key: 'current_status',
            header: 'Status',
            render: (row) => (
                <Badge className="rounded-full text-white" style={{ backgroundColor: STATUS_STYLE[row.current_status] }}>
                    {STATUS_LABEL[row.current_status]}
                </Badge>
            ),
        },
        {
            key: 'remaining_quota',
            header: 'Sisa Kuota',
            render: (row) => (row.is_unlimited ? <span className="font-medium" style={{ color: 'var(--brand-primary)' }}>Unlimited</span> : (row.remaining_quota ?? 0)),
        },
        { key: 'last_checkin_at', header: 'Check-In Terakhir', render: (row) => (row.last_checkin_at ? formatDateTime(row.last_checkin_at) : 'Belum Pernah') },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard size="mini" title="Total Member" value={summary.total_members} icon={Users} />
                <StatCard size="mini" title="Member Aktif" value={summary.active_members} icon={UserCheck} color="green" />
                <StatCard size="mini" title="Member Expired" value={summary.expired_members} icon={UserX} color="red" />
                <StatCard size="mini" title="Akan Expired (7 Hari)" value={summary.expiring_soon} icon={AlertTriangle} color="orange" />
                <StatCard size="mini" title="Member Baru Bulan Ini" value={summary.new_members_this_month} icon={UserPlus} color="blue" />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
                <SearchInput value={search} onChange={setSearch} placeholder="Cari nama member..." className="w-full sm:w-64" />
                <select
                    value={filters.membership_package_id ?? ''}
                    onChange={(e) => applyFilters({ membership_package_id: e.target.value || undefined })}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                >
                    <option value="">Semua Paket</option>
                    {membershipPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                            {pkg.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.expired_status ?? ''}
                    onChange={(e) => applyFilters({ expired_status: e.target.value || undefined })}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="expired">Expired</option>
                    <option value="expiring_in_7_days">Akan Expired 7 Hari</option>
                </select>
                <DateRangeFilter
                    value={dateRangeValue}
                    onChange={(v) => applyFilters({ m_date_preset: v.preset || undefined, m_date_from: v.date_from, m_date_to: v.date_to })}
                />
                <div className="flex flex-1 items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => window.open(withQuery(route('reports.membership.export'), filters), '_blank')}
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
                    keyExtractor={(row) => row.uuid}
                    stickyHeader
                    loading={loading}
                    sortBy={filters.m_sort_by}
                    sortDir={filters.m_sort_dir as 'asc' | 'desc'}
                    onSort={handleSort}
                    emptyTitle="Belum ada data membership"
                    emptyDescription="Membership yang terdaftar akan muncul di sini."
                />
                <Pagination
                    currentPage={data.current_page}
                    lastPage={data.last_page}
                    from={data.from}
                    to={data.to}
                    total={data.total}
                    itemLabel="member"
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
