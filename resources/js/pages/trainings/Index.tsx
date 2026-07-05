import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Download, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import DataTable from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrainingFormDialog from './components/TrainingFormDialog';
import type { Training, TrainingFilters, TrainingPagination } from '@/types/training';
import {
    formatCurrency,
    formatDateShort,
    formatTrainingDates,
    TRAINING_STATUS_LABELS,
    trainingStatusBadgeStyle,
} from './trainingHelpers';

interface Props {
    trainings: TrainingPagination & { from?: number | null; to?: number | null };
    filters: TrainingFilters;
}

const STATUS_FILTERS = [
    { value: '', label: 'Semua' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'ongoing', label: 'Berjalan' },
    { value: 'completed', label: 'Selesai' },
    { value: 'trashed', label: 'Dihapus' },
];

export default function TrainingIndex({ trainings, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Training | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<Training | undefined>();
    const [restoreTarget, setRestoreTarget] = useState<Training | undefined>();
    const [processing, setProcessing] = useState(false);

    const applyFilters = (params: Partial<TrainingFilters>) => {
        router.get(route('trainings.index'), { ...filters, ...params, page: 1 }, { preserveState: true, replace: true });
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

    const handlePageChange = (page: number) => {
        router.get(route('trainings.index'), { ...filters, page }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(route('trainings.destroy', deleteTarget.uuid), {
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setProcessing(true);
        router.patch(route('trainings.restore', restoreTarget.uuid), {}, {
            onSuccess: () => setRestoreTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Pelatihan' }, { label: 'Master Data Pelatihan' }]}>
            <Head title="Master Data Pelatihan" />

            <div className="space-y-6">
                <PageHeader
                    title="Master Data Pelatihan"
                    description="Kelola data pelatihan, jadwal, dan harga"
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => window.open(route('trainings.export'), '_blank')}
                                className="rounded-xl"
                            >
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                            <Button
                                onClick={() => {
                                    setEditTarget(undefined);
                                    setFormOpen(true);
                                }}
                                className="rounded-xl"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tambah Pelatihan
                            </Button>
                        </div>
                    }
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari judul atau trainer..."
                        className="w-full sm:w-72"
                    />
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleStatusFilter(opt.value)}
                                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                                    status === opt.value
                                        ? 'text-white'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                                style={status === opt.value ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-white shadow-sm">
                    <DataTable
                        columns={[
                            {
                                key: 'title',
                                header: 'Judul',
                                sortable: true,
                                render: (row) => (
                                    <div>
                                        <p className="font-medium text-gray-900">{row.title}</p>
                                        {row.deleted_at && (
                                            <span className="text-xs text-red-500">Dihapus</span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'trainer_name',
                                header: 'Trainer',
                                sortable: true,
                                render: (row) => row.trainer_name,
                            },
                            {
                                key: 'training_dates',
                                header: 'Tanggal',
                                render: (row) => formatTrainingDates(row.training_dates),
                            },
                            {
                                key: 'price',
                                header: 'Harga',
                                sortable: true,
                                render: (row) => formatCurrency(row.price),
                            },
                            {
                                key: 'participants_count',
                                header: 'Peserta',
                                render: (row) => row.participants_count ?? 0,
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                sortable: true,
                                render: (row) => (
                                    <Badge className="rounded-full" style={trainingStatusBadgeStyle(row.status)}>
                                        {TRAINING_STATUS_LABELS[row.status]}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'created_at',
                                header: 'Dibuat',
                                sortable: true,
                                render: (row) => formatDateShort(row.created_at),
                            },
                            {
                                key: 'actions',
                                header: 'Aksi',
                                className: 'text-right',
                                render: (row) => (
                                    <div
                                        className="flex items-center justify-end gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {row.deleted_at ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setRestoreTarget(row)}
                                                className="rounded-lg text-green-600 hover:bg-green-50"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditTarget(row);
                                                        setFormOpen(true);
                                                    }}
                                                    className="rounded-lg text-gray-500 hover:bg-gray-100"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setDeleteTarget(row)}
                                                    className="rounded-lg text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={trainings.data}
                        keyExtractor={(row) => row.uuid}
                        emptyTitle="Belum ada pelatihan"
                        emptyDescription="Tambahkan pelatihan pertama untuk mulai mengelola peserta."
                        sortBy={filters.sort_by}
                        sortDir={filters.sort_dir as 'asc' | 'desc'}
                        onSort={handleSort}
                        onRowClick={(row) => router.visit(route('trainings.show', row.uuid))}
                    />

                    <Pagination
                        currentPage={trainings.current_page}
                        lastPage={trainings.last_page}
                        from={trainings.from ?? null}
                        to={trainings.to ?? null}
                        total={trainings.total}
                        itemLabel="pelatihan"
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <TrainingFormDialog open={formOpen} onOpenChange={setFormOpen} training={editTarget} />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(undefined)}
                title="Hapus Pelatihan?"
                description={`Pelatihan "${deleteTarget?.title}" akan dihapus. Data dapat dipulihkan kembali.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />

            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(undefined)}
                title="Pulihkan Pelatihan?"
                description={`Pelatihan "${restoreTarget?.title}" akan dipulihkan.`}
                confirmLabel="Ya, Pulihkan"
                processing={processing}
                onConfirm={handleRestore}
            />
        </AppLayout>
    );
}
