import { router } from '@inertiajs/react';
import { CreditCard, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import { CalendarCheck } from 'lucide-react';
import {
    formatCurrency,
    formatDateShort,
    formatTime,
    PAYMENT_STATUS_LABELS,
    paymentBadgeStyle,
    STATUS_LABELS,
    statusBadgeStyle,
} from '../bookingHelpers';
import type { StudioBooking, StudioBookingFilters, StudioBookingPagination } from '@/types/booking';

interface BookingTableProps {
    bookings: StudioBookingPagination;
    filters: StudioBookingFilters;
    onSort: (column: string) => void;
    onView: (booking: StudioBooking) => void;
    onPay: (booking: StudioBooking) => void;
    onDelete: (booking: StudioBooking) => void;
    onRestore: (booking: StudioBooking) => void;
}

export default function BookingTable({ bookings, filters, onSort, onView, onPay, onDelete, onRestore }: BookingTableProps) {
    const SortIcon = ({ column }: { column: string }) => {
        if (filters.sort_by !== column) return <span className="ml-1 text-gray-300">↕</span>;
        return <span className="ml-1">{filters.sort_dir === 'asc' ? '↑' : '↓'}</span>;
    };

    if (bookings.data.length === 0) {
        return (
            <div className="rounded-2xl bg-white shadow-sm">
                <EmptyState
                    icon={CalendarCheck}
                    title="Belum ada booking"
                    description="Booking sanggar yang dibuat akan muncul di sini."
                />
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                                onClick={() => onSort('customer_name')}
                            >
                                Pelanggan <SortIcon column="customer_name" />
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                                onClick={() => onSort('booking_date')}
                            >
                                Tanggal <SortIcon column="booking_date" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Jam</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Durasi</th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                                onClick={() => onSort('price')}
                            >
                                Harga <SortIcon column="price" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Pembayaran</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.data.map((booking) => (
                            <tr
                                key={booking.uuid}
                                className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50/50 ${booking.deleted_at ? 'opacity-60' : ''}`}
                                onClick={() => onView(booking)}
                            >
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                                    <p className="text-xs text-gray-400">{booking.customer_phone}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{formatDateShort(booking.booking_date)}</td>
                                <td className="px-4 py-3 text-gray-700">
                                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{Math.round(booking.duration_minutes / 60)} jam</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(booking.price)}</td>
                                <td className="px-4 py-3">
                                    <Badge className="rounded-full text-white" style={paymentBadgeStyle(booking.payment_status)}>
                                        {PAYMENT_STATUS_LABELS[booking.payment_status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className="rounded-full text-white" style={statusBadgeStyle(booking.status)}>
                                        {STATUS_LABELS[booking.status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                        {booking.deleted_at ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onRestore(booking)}
                                                className="rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <>
                                                {booking.payment_status === 'unpaid' && booking.status !== 'cancelled' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onPay(booking)}
                                                        className="rounded-lg text-green-600 hover:bg-green-50"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onView(booking)}
                                                    className="rounded-lg text-gray-500 hover:bg-gray-100"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onDelete(booking)}
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

            {bookings.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                    <p className="text-sm text-gray-500">
                        Menampilkan {bookings.from}–{bookings.to} dari {bookings.total} booking
                    </p>
                    <div className="flex gap-1">
                        {Array.from({ length: bookings.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => router.get(route('bookings.index'), { ...filters, page })}
                                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                                    page === bookings.current_page ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                style={page === bookings.current_page ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
