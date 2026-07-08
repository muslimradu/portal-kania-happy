import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, Pencil, RotateCcw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GymClassFormDialog from './components/GymClassFormDialog';
import type { GymClass, GymClassPagination, GymClassFilters } from '@/types/gym-class';
import { formatCurrency } from '@/lib/format';

interface Props {
    gymClasses: GymClassPagination;
    filters: GymClassFilters;
}


function GymClassIcon({ icon, color }: { icon: string; color: string }) {
    if (/\p{Emoji}/u.test(icon)) {
        return (
            <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: color + '20' }}
            >
                {icon}
            </div>
        );
    }

    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[icon];
    if (Icon) {
        return (
            <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: color + '20' }}
            >
                <Icon className="h-5 w-5" style={{ color }} />
            </div>
        );
    }

    return (
        <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: color + '20' }}
        >
            💪
        </div>
    );
}

export default function GymClassIndex({ gymClasses, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<GymClass | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<GymClass | undefined>();
    const [restoreTarget, setRestoreTarget] = useState<GymClass | undefined>();
    const [processing, setProcessing] = useState(false);

    const applyFilters = (params: Partial<GymClassFilters>) => {
        router.get(route('gym-classes.index'), {
            ...filters,
            ...params,
            page: 1,
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
        router.delete(route('gym-classes.destroy', deleteTarget.uuid), {
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setProcessing(true);
        router.patch(route('gym-classes.restore', restoreTarget.uuid), {}, {
            onSuccess: () => setRestoreTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (filters.sort_by !== column) return <span className="ml-1 text-gray-300">↕</span>;
        return <span className="ml-1">{filters.sort_dir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Senam' }]}>
            <Head title="Kelas Gym" />

            <div className="space-y-6">
                <PageHeader
                    title="Kelas Gym"
                    description="Kelola kelas senam dan gym yang tersedia"
                    action={
                        <Button
                            onClick={() => { setEditTarget(undefined); setFormOpen(true); }}
                            className="rounded-xl"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kelas
                        </Button>
                    }
                />

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari nama kelas..."
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
                    {gymClasses.data.length === 0 ? (
                        <EmptyState
                            icon={LucideIcons.Dumbbell}
                            title="Belum ada kelas gym"
                            description="Tambahkan kelas gym pertama untuk mulai mengelola jadwal senam."
                            action={{ label: 'Tambah Kelas', onClick: () => setFormOpen(true) }}
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Icon
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                                                onClick={() => handleSort('name')}
                                            >
                                                Nama <SortIcon column="name" />
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                                                onClick={() => handleSort('price')}
                                            >
                                                Harga <SortIcon column="price" />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Status
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Dibuat <SortIcon column="created_at" />
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gymClasses.data.map((item) => (
                                            <tr
                                                key={item.uuid}
                                                className={`border-b border-gray-50 transition hover:bg-gray-50/50 ${item.deleted_at ? 'opacity-60' : ''}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <GymClassIcon icon={item.icon} color={item.color_label} />
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {item.name}
                                                    {item.deleted_at && (
                                                        <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-500">Dihapus</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className="rounded-full text-white"
                                                        style={{
                                                            backgroundColor: item.is_active ? '#16a34a' : '#6b7280',
                                                        }}
                                                    >
                                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {item.deleted_at ? (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setRestoreTarget(item)}
                                                                className="rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => { setEditTarget(item); setFormOpen(true); }}
                                                                    className="rounded-lg text-gray-500 hover:bg-gray-100"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setDeleteTarget(item)}
                                                                    className="rounded-lg text-red-500 hover:bg-red-50"
                                                                >
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
                            {gymClasses.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                                    <p className="text-sm text-gray-500">
                                        Menampilkan {gymClasses.from}–{gymClasses.to} dari {gymClasses.total} kelas
                                    </p>
                                    <div className="flex gap-1">
                                        {Array.from({ length: gymClasses.last_page }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => router.get(route('gym-classes.index'), { ...filters, page })}
                                                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                                                    page === gymClasses.current_page
                                                        ? 'text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                                style={page === gymClasses.current_page ? { backgroundColor: 'var(--brand-primary)' } : {}}
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

            {/* Form Dialog */}
            <GymClassFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                gymClass={editTarget}
            />

            {/* Delete Confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(undefined)}
                title="Hapus Kelas Gym?"
                description={`Kelas "${deleteTarget?.name}" akan dihapus. Data dapat dipulihkan kembali.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />

            {/* Restore Confirm */}
            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(undefined)}
                title="Pulihkan Kelas Gym?"
                description={`Kelas "${restoreTarget?.name}" akan dipulihkan dan dapat digunakan kembali.`}
                confirmLabel="Ya, Pulihkan"
                variant="default"
                processing={processing}
                onConfirm={handleRestore}
            />
        </AppLayout>
    );
}