import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, RotateCcw, Package } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PackageFormDialog from './components/PackageFormDialog';
import type { MembershipPackage, MembershipPackagePagination, MembershipPackageFilters } from '@/types/membership-package';
import type { GymClass } from '@/types/gym-class';

interface Props {
    packages: MembershipPackagePagination;
    gymClasses: GymClass[];
    filters: MembershipPackageFilters;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatExpired(type: string, duration: number | null): string {
    if (type === 'manual') return 'Manual';
    if (!duration) return '-';
    const labels: Record<string, string> = {
        days: 'Hari', weeks: 'Minggu', months: 'Bulan', years: 'Tahun',
    };
    return `${duration} ${labels[type] ?? type}`;
}

export default function MembershipPackageIndex({ packages, gymClasses, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<MembershipPackage | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<MembershipPackage | undefined>();
    const [restoreTarget, setRestoreTarget] = useState<MembershipPackage | undefined>();
    const [processing, setProcessing] = useState(false);

    const applyFilters = (params: Partial<MembershipPackageFilters>) => {
        router.get(route('membership-packages.index'), {
            ...filters, ...params, page: 1,
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        applyFilters({ status: value });
    };

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(route('membership-packages.destroy', deleteTarget.uuid), {
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setProcessing(true);
        router.patch(route('membership-packages.restore', restoreTarget.uuid), {}, {
            onSuccess: () => setRestoreTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (filters.sort_by !== column) return <span className="ml-1 text-gray-300">↕</span>;
        return <span className="ml-1">{filters.sort_dir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Paket Membership' }]}>
            <Head title="Paket Membership" />

           className="space-y-6">
                <PageHeader
                    title="Paket Membership"
                    description="Kelola paket membership yang tersedia untuk member"
                    action={
                        <Button
                            onClick={() => { setEditTarget(undefined); setFormOpen(true); }}
                            className="rounded-xl"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Paket
                        </Button>
                    }
                />

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari nama paket..."
                        className="w-full sm:w-72"
                    />
                    <div className="flex gap-2">
                        {[
                            { value: '', label: 'Semua' },
                            { value: 'active', label: 'Aktif' },
                            { value: 'inactive', label: 'Nonaktif' },
                            { value: 'trashed', label: 'Dihapus' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleStatusFilter(opt.value)}
                                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                                    status === opt.value
                                        ? 'text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                                style={status === opt.value ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl bg-white shadow-sm">
                    {packages.data.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title="Belum ada paket membership"
                            description="Tambahkan paket membership untuk mulai mendaftarkan member."
                            action={{ label: 'Tambah Paket', onClick: () => setFormOpen(true) }}
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600" onClick={() => handleSort('name')}>
                                                Nama Paket <SortIcon column="name" />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Total Kelas
                                            </th>
                                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600" onClick={() => handleSort('price')}>
                                                Harga <SortIcon column="price" />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Expired
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packages.data.map((item) => (
                                            <tr key={item.uuid} className={`border-b border-gray-50 transition hover:bg-gray-50/50 ${item.deleted_at ? 'opacity-60' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">
                                                        {item.name}
                                                        {item.deleted_at && (
                                                            <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-500">Dihapus</span>
                                                        )}
                                                    </p>
                                                    {item.description && (
                                                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{item.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.details.map((detail) => (
                                                            <span
                                                                key={detail.uuid}
                                                                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                                                style={{ backgroundColor: detail.gym_class?.color_label ?? '#6b7280' }}
                                                            >
                                                                {detail.gym_class?.name} · {detail.is_unlimited ? '∞' : `${detail.quota}x`}
                                                            </span>
                                                        ))}
                                                 </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {formatExpired(item.expired_type, item.expired_duration)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className="rounded-full text-white"
                                                        style={{ backgroundColor: item.is_active ? '#16a34a' : '#6b7280' }}
                                                    >
                                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {item.deleted_at ? (
                                                            <Button size="sm" variant="ghost" onClick={() => setRestoreTarget(item)} className="rounded-lg text-green-600 hover:bg-green-50">
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button size="sm" variant="ghost" onClick={() => { setEditTarget(item); setFormOpen(true); }} className="rounded-lg text-gray-500 hover:bg-gray-100">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)} className="rounded-lg text-red-500 hover:bg-red-50">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {packages.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                                    <p className="text-sm text-gray-500">
                                        Menampilkan {packages.from}–{packages.to} dari {packages.total} paket
                                    </p>
                                    <div className="flex gap-1">
                                        {Array.from({ lgth: packages.last_page }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => router.get(route('membership-packages.index'), { ...filters, page })}
                                                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${page === packages.current_page ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                style={page === packages.current_page ? { backgroundColor: 'var(--brand-primary)' } : {}}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <PackageFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                pkg={editTarget}
                gymClasses={gymClasses}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(undefined)}
                title="Hapus Paket Membership?"
                description={`Paket "${deleteTarget?.name}" akan dihapus. Data dapat dipulihkan kembali.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />

            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(undefined)}
                title="Pulihkan Paket Membership?"
                description={`Paket "${restoreTarget?.name}" akan dipulihkan.`}
                confirmLabel="Ya, Pulihkan"
                variant="default"
                processing={processing}
                onConfirm={handleRestore}
            />
        </AppLayout>
    );
}
