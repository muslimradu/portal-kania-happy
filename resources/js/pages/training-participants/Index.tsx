import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    CreditCard,
    Download,
    Eye,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import DataTable from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ParticipantFormDialog from './components/ParticipantFormDialog';
import PaymentDialog from './components/PaymentDialog';
import type { TrainingOption } from '@/types/training';
import type {
    TrainingParticipant,
    TrainingParticipantFilters,
    TrainingParticipantPagination,
} from '@/types/training-participant';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import {
    formatCurrency,
    formatDateShort,
    PAYMENT_STATUS_LABELS,
    paymentBadgeStyle,
} from '@/pages/trainings/trainingHelpers';

interface Props {
    participants: TrainingParticipantPagination & { from?: number | null; to?: number | null };
    filters: TrainingParticipantFilters;
    trainings: TrainingOption[];
    paymentConfigurations: PaymentConfiguration[];
}

const PAYMENT_FILTERS = [
    { value: '', label: 'Semua Pembayaran' },
    { value: 'paid', label: 'Lunas' },
    { value: 'unpaid', label: 'Belum Bayar' },
    { value: 'pay_later', label: 'Bayar Nanti' },
];

const STATUS_FILTERS = [
    { value: '', label: 'Aktif' },
    { value: 'trashed', label: 'Dihapus' },
];

export default function TrainingParticipantIndex({
    participants,
    filters,
    trainings,
    paymentConfigurations,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [trainingUuid, setTrainingUuid] = useState(filters.training_uuid ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [payTarget, setPayTarget] = useState<TrainingParticipant | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<TrainingParticipant | undefined>();
    const [restoreTarget, setRestoreTarget] = useState<TrainingParticipant | undefined>();
    const [processing, setProcessing] = useState(false);

    const applyFilters = (params: Partial<TrainingParticipantFilters>) => {
        router.get(
            route('training-participants.index'),
            { ...filters, ...params, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(route('training-participants.destroy', deleteTarget.uuid), {
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setProcessing(true);
        router.patch(route('training-participants.restore', restoreTarget.uuid), {}, {
            onSuccess: () => setRestoreTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Pelatihan' }, { label: 'Daftar Pelatihan' }]}>
            <Head title="Daftar Pelatihan" />

            <div className="space-y-6">
                <PageHeader
                    title="Daftar Pelatihan"
                    description="Kelola pendaftaran peserta pelatihan"
                    action={
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                                    <Download className="mr-2 h-4 w-4" /> Export
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 bg-white">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() =>
                                            window.open(route('training-participants.export.participants'), '_blank')
                                        }
                                    >
                                        Export Peserta
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() =>
                                            window.open(route('training-participants.export.payments'), '_blank')
                                        }
                                    >
                                        Export Pembayaran
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                onClick={() => setFormOpen(true)}
                                className="rounded-xl"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tambah Peserta
                            </Button>
                        </div>
                    }
                />

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <SearchInput
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                applyFilters({ search: value });
                            }}
                            placeholder="Cari nama atau nomor HP..."
                            className="w-full sm:w-72"
                        />
                        <select
                            value={trainingUuid}
                            onChange={(e) => {
                                setTrainingUuid(e.target.value);
                                applyFilters({ training_uuid: e.target.value || undefined });
                            }}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm sm:w-56"
                        >
                            <option value="">Semua Pelatihan</option>
                            {trainings.map((t) => (
                                <option key={t.uuid} value={t.uuid}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {PAYMENT_FILTERS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setPaymentStatus(opt.value);
                                    applyFilters({ payment_status: opt.value });
                                }}
                                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                                    paymentStatus === opt.value
                                        ? 'text-white'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                                style={
                                    paymentStatus === opt.value
                                        ? { backgroundColor: 'var(--brand-primary)' }
                                        : {}
                                }
                            >
                                {opt.label}
                            </button>
                        ))}
                        {STATUS_FILTERS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setStatus(opt.value);
                                    applyFilters({ status: opt.value });
                                }}
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
                                key: 'full_name',
                                header: 'Nama',
                                sortable: true,
                                render: (row) => (
                                    <div>
                                        <Link
                                            href={route('training-participants.show', row.uuid)}
                                            className="font-medium text-gray-900 hover:underline"
                                        >
                                            {row.full_name}
                                        </Link>
                                        {row.deleted_at && (
                                            <span className="ml-2 text-xs text-red-500">Dihapus</span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'phone',
                                header: 'Nomor HP',
                                render: (row) => row.phone,
                            },
                            {
                                key: 'training',
                                header: 'Pelatihan',
                                render: (row) => row.training?.title ?? '-',
                            },
                            {
                                key: 'amount',
                                header: 'Harga',
                                render: (row) => formatCurrency(row.amount),
                            },
                            {
                                key: 'payment_status',
                                header: 'Pembayaran',
                                sortable: true,
                                render: (row) => (
                                    <Badge className="rounded-full text-white" style={paymentBadgeStyle(row.payment_status)}>
                                        {PAYMENT_STATUS_LABELS[row.payment_status]}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'created_at',
                                header: 'Didaftarkan',
                                sortable: true,
                                render: (row) => formatDateShort(row.created_at),
                            },
                            {
                                key: 'actions',
                                header: 'Aksi',
                                className: 'text-right',
                                render: (row) => (
                                    <div className="flex items-center justify-end gap-1">
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
                                                    asChild
                                                    className="rounded-lg text-gray-500 hover:bg-gray-100"
                                                >
                                                    <Link href={route('training-participants.show', row.uuid)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {(row.payment_status === 'unpaid' ||
                                                    row.payment_status === 'pay_later') && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setPayTarget(row)}
                                                        className="rounded-lg text-orange-600 hover:bg-orange-50"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>
                                                )}
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
                        data={participants.data}
                        keyExtractor={(row) => row.uuid}
                        emptyTitle="Belum ada peserta"
                        emptyDescription="Daftarkan peserta pelatihan pertama."
                        sortBy={filters.sort_by}
                        sortDir={filters.sort_dir as 'asc' | 'desc'}
                        onSort={handleSort}
                    />

                    <Pagination
                        currentPage={participants.current_page}
                        lastPage={participants.last_page}
                        from={participants.from ?? null}
                        to={participants.to ?? null}
                        total={participants.total}
                        itemLabel="peserta"
                        onPageChange={(page) =>
                            router.get(
                                route('training-participants.index'),
                                { ...filters, page },
                                { preserveState: true, replace: true },
                            )
                        }
                    />
                </div>
            </div>

            <ParticipantFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                trainings={trainings}
                paymentConfigurations={paymentConfigurations}
            />

            <PaymentDialog
                open={!!payTarget}
                onOpenChange={(open) => !open && setPayTarget(undefined)}
                participant={payTarget}
                paymentConfigurations={paymentConfigurations}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(undefined)}
                title="Hapus Peserta?"
                description={`Peserta "${deleteTarget?.full_name}" akan dihapus.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />

            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(undefined)}
                title="Pulihkan Peserta?"
                description={`Peserta "${restoreTarget?.full_name}" akan dipulihkan.`}
                confirmLabel="Ya, Pulihkan"
                processing={processing}
                onConfirm={handleRestore}
            />
        </AppLayout>
    );
}
