import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateLong, formatDuration, PAYMENT_METHOD_LABELS } from '../../bookingHelpers';
import type { BookingStep1Values, BookingStep2Values } from '@/lib/validations/booking';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { PaymentMethod } from '@/types/booking';

interface Step4ConfirmationProps {
    customerInfo: BookingStep1Values;
    schedule: BookingStep2Values;
    duration: number;
    price: number;
    payNow: boolean;
    paymentMethod: PaymentMethod;
    paymentConfiguration: PaymentConfiguration | null;
    processing: boolean;
    onBack: () => void;
    onSubmit: () => void;
}

export default function Step4Confirmation({
    customerInfo,
    schedule,
    duration,
    price,
    payNow,
    paymentMethod,
    paymentConfiguration,
    processing,
    onBack,
    onSubmit,
}: Step4ConfirmationProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Periksa kembali data sebelum menyelesaikan booking.
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pelanggan</p>
                <p className="mt-1 font-semibold text-gray-900">{customerInfo.customer_name}</p>
                <p className="text-sm text-gray-500">{customerInfo.customer_phone}</p>
                {customerInfo.notes && <p className="mt-1 text-sm text-gray-500">{customerInfo.notes}</p>}
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Jadwal</p>
                <p className="mt-1 font-semibold text-gray-900">{formatDateLong(schedule.booking_date)}</p>
                <p className="text-sm text-gray-500">
                    {schedule.start_time} - {schedule.end_time} ({formatDuration(duration)})
                </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pembayaran</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-gray-900">
                        {payNow ? `Lunas · ${PAYMENT_METHOD_LABELS[paymentMethod]}` : 'Belum Bayar'}
                        {payNow && paymentConfiguration ? ` · ${paymentConfiguration.name}` : ''}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-900">Total Harga</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                        {formatCurrency(price)}
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} disabled={processing} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={processing}
                    className="flex-1 rounded-xl"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                        </>
                    ) : (
                        'Buat Booking'
                    )}
                </Button>
            </div>
        </div>
    );
}
