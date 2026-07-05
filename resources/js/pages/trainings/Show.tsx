import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    MapPin,
    User,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import SearchInput from '@/components/shared/SearchInput';
import DataTable from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Training } from '@/types/training';
import type { TrainingParticipant, TrainingParticipantFilters, TrainingParticipantPagination } from '@/types/training-participant';
import {
    formatCurrency,
    formatDateShort,
    formatTrainingDates,
    PAYMENT_STATUS_LABELS,
    paymentBadgeStyle,
    TRAINING_STATUS_LABELS,
    trainingStatusBadgeStyle,
} from './trainingHelpers';

interface Props {
    training: Training;
    participants: TrainingParticipantPagination & { from?: number | null; to?: number | null };
    filters: TrainingParticipantFilters;
}

const PAYMENT_FILTERS = [
    { value: '', label: 'Semua' },
    { value: 'paid', label: 'Lunas' },
    { value: 'unpaid', label: 'Belum Bayar' },
    { value: 'pay_later', label: 'Bayar Nanti' },
];

export default function TrainingShow({ training, participants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');
    const [trainingDate, setTrainingDate] = useState(filters.training_date ?? '');

    const trainingDates = [...(training.training_dates ?? [])].sort();
    const showDateFilter = trainingDates.length > 1;

    const applyFilters = (params: Partial<TrainingParticipantFilters>) => {
        router.get(
            route('trainings.show', training.uuid),
            { ...filters, ...params, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    return (
        <AppLayout
            breadcrumb={[
                { label: 'Master Data Pelatihan', href: route('trainings.index') },
                { label: training.title },
            ]}
        >
            <Head title={training.title} />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('trainings.index')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-2xl font-bold text-gray-900">{training.title}</h1>
                        <p className="text-sm text-gray-500">{training.trainer_name}</p>
                    </div>
                    <Badge className="rounded-full" style={trainingStatusBadgeStyle(training.status)}>
                        {TRAINING_STATUS_LABELS[training.status]}
                    </Badge>
                </div>

                <Tabs defaultValue="info">
                    <TabsList variant="line" className="border-b border-gray-100">
                        <TabsTrigger value="info">Informasi Pelatihan</TabsTrigger>
                        <TabsTrigger value="participants">
                            Daftar Peserta
                            {(training.participants_count ?? 0) > 0 && (
                                <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                    {training.participants_count}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-4">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Trainer</p>
                                        <p className="text-sm font-medium text-gray-900">{training.trainer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Tanggal Pelatihan</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatTrainingDates(training.training_dates)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Lokasi</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {training.training_location || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Harga</p>
                                        <p className="text-sm font-medium text-gray-900">{formatCurrency(training.price)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 sm:col-span-2">
                                    <Users className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Statistik Peserta</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {training.participants_count ?? 0} total ·{' '}
                                            {training.paid_participants_count ?? 0} lunas ·{' '}
                                            {training.unpaid_participants_count ?? 0} belum lunas
                                        </p>
                                    </div>
                                </div>
                                {training.description && (
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-gray-400">Deskripsi</p>
                                        <p className="mt-1 text-sm text-gray-700">{training.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="participants" className="mt-4 space-y-4">
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
                            </div>
                        </div>

                        {showDateFilter && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-gray-400">Tanggal:</span>
                                <button
                                    onClick={() => {
                                        setTrainingDate('');
                                        applyFilters({ training_date: '' });
                                    }}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                                        trainingDate === ''
                                            ? 'text-white'
                                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                    style={
                                        trainingDate === ''
                                            ? { backgroundColor: 'var(--brand-primary)' }
                                            : undefined
                                    }
                                >
                                    Semua
                                </button>
                                {trainingDates.map((date) => (
                                    <button
                                        key={date}
                                        onClick={() => {
                                            setTrainingDate(date);
                                            applyFilters({ training_date: date });
                                        }}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                                            trainingDate === date
                                                ? 'text-white'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                        style={
                                            trainingDate === date
                                                ? { backgroundColor: 'var(--brand-primary)' }
                                                : undefined
                                        }
                                    >
                                        {formatDateShort(date)}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="rounded-2xl bg-white shadow-sm">
                            <DataTable
                                columns={[
                                    {
                                        key: 'full_name',
                                        header: 'Nama',
                                        sortable: true,
                                        render: (row) => (
                                            <Link
                                                href={route('training-participants.show', row.uuid)}
                                                className="font-medium text-gray-900 hover:underline"
                                            >
                                                {row.full_name}
                                            </Link>
                                        ),
                                    },
                                    {
                                        key: 'phone',
                                        header: 'Nomor HP',
                                        render: (row) => row.phone,
                                    },
                                    {
                                        key: 'selected_training_dates',
                                        header: 'Tanggal Diikuti',
                                        render: (row) => (
                                            <span className="text-gray-600">
                                                {row.selected_training_dates?.length
                                                    ? formatTrainingDates(row.selected_training_dates)
                                                    : '-'}
                                            </span>
                                        ),
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
                                        key: 'invoice_number',
                                        header: 'Invoice',
                                        render: (row) => row.invoice_number ?? '-',
                                    },
                                ]}
                                data={participants.data}
                                keyExtractor={(row) => row.uuid}
                                emptyTitle="Belum ada peserta"
                                emptyDescription="Peserta yang mendaftar melalui Daftar Pelatihan akan muncul di sini."
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
                                        route('trainings.show', training.uuid),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
