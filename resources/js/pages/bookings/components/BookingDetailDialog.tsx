import { Ban, CreditCard, Pencil, Phone, Trash2, User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    formatCurrency,
    formatDateLong,
    formatDuration,
    formatTime,
    PAYMENT_METHOD_LABELS,
    PAYMENT_STATUS_LABELS,
    paymentBadgeStyle,
    STATUS_LABELS,
    statusBadgeStyle,
} from '../bookingHelpers';
import type { StudioBooking } from '@/types/booking';

interface BookingDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking?: StudioBooking;
    onEdit: (booking: StudioBooking) => void;
    onPay: (booking: StudioBooking) => void;
    onCancel: (booking: StudioBooking) => void;
    onDelete: (booking: StudioBooking) => void;
}

export default function BookingDetailDialog({ open, onOpenChange, booking, onEdit, onPay, onCancel, onDelete }: BookingDetailDialogProps) {
    if (!booking) return null;

    const canEdit = !booking.deleted_at && booking.status !== 'cancelled' && booking.status !== 'completed';
    const canPay = !booking.deleted_at && booking.payment_status === 'unpaid' && booking.status !== 'cancelled';
    const canCancel = !booking.deleted_at && booking.status !== 'cancelled' && booking.status !== 'completed';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ backgroundColor: 'white', width: '90vw', maxWidth: '520px' }} className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Booking</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full text-white" style={statusBadgeStyle(booking.status)}>
                            {STATUS_LABELS[booking.status]}
                        </Badge>
                        <Badge className="rounded-full text-white" style={paymentBadgeStyle(booking.payment_status)}>
                            {PAYMENT_STATUS_LABELS[booking.payment_status]}
                        </Badge>
                        {booking.deleted_at && (
                            <Badge className="rounded-full bg-red-50 text-red-500">Dihapus</Badge>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-start gap-3">
                            <User className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                                <p className="flex items-center gap-1 text-sm text-gray-500">
                                    <Phone className="h-3 w-3" /> {booking.customer_phone}
                                </p>
                            </div>
                        </div>
                        {booking.notes && <p className="mt-3 text-sm text-gray-500">{booking.notes}</p>}
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Jadwal</p>
                        <p className="mt-1 font-semibold text-gray-900">{formatDateLong(booking.booking_date)}</p>
                        <p className="text-sm text-gray-500">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)} ({formatDuration(booking.duration_minutes)})
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pembayaran</p>
                        <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-gray-600">Metode</span>
                            <span className="font-medium text-gray-900">
                                {booking.payment_method ? PAYMENT_METHOD_LABELS[booking.payment_method] : '-'}
                            </span>
                        </div>
                        {booking.invoice_number && (
                            <div className="mt-1 flex items-center justify-between text-sm">
                                <span className="text-gray-600">No. Invoice</span>
                                <span className="font-mono font-medium text-gray-900">{booking.invoice_number}</span>
                            </div>
                        )}
                        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                            <span className="font-semibold text-gray-900">Total Harga</span>
                            <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                                {formatCurrency(booking.price)}
                            </span>
                        </div>
                    </div>

                    {booking.status === 'cancelled' && booking.cancel_reason && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">Alasan pembatalan: {booking.cancel_reason}</div>
                    )}
                </div>

                <DialogFooter className="flex-wrap">
                    {canPay && (
                        <Button type="button" onClick={() => onPay(booking)} className="rounded-xl" style={{ backgroundColor: '#16a34a' }}>
                            <CreditCard className="mr-2 h-4 w-4" /> Proses Pembayaran
                        </Button>
                    )}
                    {canEdit && (
                        <Button type="button" variant="outline" onClick={() => onEdit(booking)} className="rounded-xl">
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    )}
                    {canCancel && (
                        <Button type="button" variant="outline" onClick={() => onCancel(booking)} className="rounded-xl text-orange-600 hover:bg-orange-50">
                            <Ban className="mr-2 h-4 w-4" /> Batalkan
                        </Button>
                    )}
                    {!booking.deleted_at && (
                        <Button type="button" variant="outline" onClick={() => onDelete(booking)} className="rounded-xl text-red-500 hover:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
