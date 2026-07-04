import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Download, Plus, Settings2, Table2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import BookingTable from './components/BookingTable';
import CalendarPanel from './components/calendar/CalendarPanel';
import BookingFormWizard from './components/wizard/BookingFormWizard';
import BookingEditDialog from './components/BookingEditDialog';
import BookingDetailDialog from './components/BookingDetailDialog';
import PaymentProcessDialog from './components/PaymentProcessDialog';
import CancelBookingDialog from './components/CancelBookingDialog';
import BookingSettingsDialog from './components/BookingSettingsDialog';
import type { BookingSettings, StudioBooking, StudioBookingFilters, StudioBookingPagination } from '@/types/booking';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { BookingStep2Values } from '@/lib/validations/booking';

interface Props {
    bookings: StudioBookingPagination;
    filters: StudioBookingFilters;
    paymentConfigurations: PaymentConfiguration[];
    bookingSettings: BookingSettings;
}

const STATUS_OPTIONS = [
    { value: '', label: 'Semua' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
    { value: 'trashed', label: 'Dihapus' },
];

const PAYMENT_OPTIONS = [
    { value: '', label: 'Semua Pembayaran' },
    { value: 'unpaid', label: 'Belum Bayar' },
    { value: 'paid', label: 'Lunas' },
];

export default function BookingIndex({ bookings, filters, paymentConfigurations, bookingSettings }: Props) {
    const [tab, setTab] = useState<'calendar' | 'table'>('calendar');
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');

    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardPrefill, setWizardPrefill] = useState<Partial<BookingStep2Values> | undefined>();
    const [refreshKey, setRefreshKey] = useState(0);

    const [detailTarget, setDetailTarget] = useState<StudioBooking | undefined>();
    const [editTarget, setEditTarget] = useState<StudioBooking | undefined>();
    const [payTarget, setPayTarget] = useState<StudioBooking | undefined>();
    const [cancelTarget, setCancelTarget] = useState<StudioBooking | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<StudioBooking | undefined>();
    const [restoreTarget, setRestoreTarget] = useState<StudioBooking | undefined>();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const applyFilters = (params: Partial<StudioBookingFilters>) => {
        router.get(route('bookings.index'), { ...filters, ...params, page: 1 }, { preserveState: true, replace: true });
    };

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    const bumpRefresh = () => setRefreshKey((k) => k + 1);

    const openWizard = (prefill?: Partial<BookingStep2Values>) => {
        setWizardPrefill(prefill);
        setWizardOpen(true);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(route('bookings.destroy', deleteTarget.uuid), {
            onSuccess: () => {
                setDeleteTarget(undefined);
                bumpRefresh();
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setProcessing(true);
        router.patch(
            route('bookings.restore', restoreTarget.uuid),
            {},
            {
                onSuccess: () => {
                    setRestoreTarget(undefined);
                    bumpRefresh();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Booking Sanggar' }]}>
            <Head title="Booking Sanggar" />

            <div className="space-y-6">
                <PageHeader
                    title="Booking Sanggar"
                    description="Kelola jadwal booking studio sanggar"
                    action={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-xl">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={() => window.open(route('bookings.export'), '_blank')} className="rounded-xl">
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                            <Button onClick={() => openWizard()} className="rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                <Plus className="mr-2 h-4 w-4" /> Booking Baru
                            </Button>
                        </div>
                    }
                />

                {/* Tab Switch */}
                <div className="flex gap-1 rounded-xl bg-gray-100 p-1 sm:w-fit">
                    <button
                        onClick={() => setTab('calendar')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none ${
                            tab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <CalendarDays className="h-4 w-4" /> Kalender
                    </button>
                    <button
                        onClick={() => setTab('table')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none ${
                            tab === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Table2 className="h-4 w-4" /> Tabel
                    </button>
                </div>

                {tab === 'calendar' && (
                    <CalendarPanel
                        bookingSettings={bookingSettings}
                        refreshKey={refreshKey}
                        onSelectBooking={(booking) => setDetailTarget(booking)}
                        onSelectEmptySlot={(date, startTime, endTime) => openWizard({ booking_date: date, start_time: startTime, end_time: endTime })}
                    />
                )}

                {tab === 'table' && (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                            <SearchInput
                                value={search}
                                onChange={(v) => {
                                    setSearch(v);
                                    applyFilters({ search: v });
                                }}
                                placeholder="Cari nama, telepon, atau invoice..."
                                className="w-full sm:w-72"
                            />
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setStatus(opt.value);
                                            applyFilters({ status: opt.value });
                                        }}
                                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                                            status === opt.value ? 'text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                        style={status === opt.value ? { backgroundColor: 'var(--brand-primary)' } : {}}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <select
                                value={paymentStatus}
                                onChange={(e) => {
                                    setPaymentStatus(e.target.value);
                                    applyFilters({ payment_status: e.target.value });
                                }}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                            >
                                {PAYMENT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <BookingTable
                            bookings={bookings}
                            filters={filters}
                            onSort={handleSort}
                            onView={(booking) => setDetailTarget(booking)}
                            onPay={(booking) => setPayTarget(booking)}
                            onDelete={(booking) => setDeleteTarget(booking)}
                            onRestore={(booking) => setRestoreTarget(booking)}
                        />
                    </div>
                )}
            </div>

            <BookingFormWizard
                open={wizardOpen}
                onOpenChange={(open) => {
                    setWizardOpen(open);
                    if (!open) bumpRefresh();
                }}
                paymentConfigurations={paymentConfigurations}
                bookingSettings={bookingSettings}
                prefill={wizardPrefill}
            />

            <BookingDetailDialog
                open={!!detailTarget}
                onOpenChange={(open) => !open && setDetailTarget(undefined)}
                booking={detailTarget}
                onEdit={(booking) => {
                    setDetailTarget(undefined);
                    setEditTarget(booking);
                }}
                onPay={(booking) => {
                    setDetailTarget(undefined);
                    setPayTarget(booking);
                }}
                onCancel={(booking) => {
                    setDetailTarget(undefined);
                    setCancelTarget(booking);
                }}
                onDelete={(booking) => {
                    setDetailTarget(undefined);
                    setDeleteTarget(booking);
                }}
            />

            <BookingEditDialog
                open={!!editTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditTarget(undefined);
                        bumpRefresh();
                    }
                }}
                booking={editTarget}
                bookingSettings={bookingSettings}
            />

            <PaymentProcessDialog
                open={!!payTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setPayTarget(undefined);
                        bumpRefresh();
                    }
                }}
                booking={payTarget}
                paymentConfigurations={paymentConfigurations}
            />

            <CancelBookingDialog
                open={!!cancelTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setCancelTarget(undefined);
                        bumpRefresh();
                    }
                }}
                booking={cancelTarget}
            />

            <BookingSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} bookingSettings={bookingSettings} />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(undefined)}
                title="Hapus Booking?"
                description={`Booking "${deleteTarget?.customer_name}" akan dihapus. Data dapat dipulihkan kembali.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />

            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(undefined)}
                title="Pulihkan Booking?"
                description={`Booking "${restoreTarget?.customer_name}" akan dipulihkan.`}
                confirmLabel="Ya, Pulihkan"
                variant="default"
                processing={processing}
                onConfirm={handleRestore}
            />
        </AppLayout>
    );
}
