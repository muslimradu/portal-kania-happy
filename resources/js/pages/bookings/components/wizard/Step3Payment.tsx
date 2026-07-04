import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentMethodSelector from '../PaymentMethodSelector';
import { formatCurrency } from '../../bookingHelpers';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { PaymentMethod } from '@/types/booking';

interface Step3PaymentProps {
    price: number;
    paymentConfigurations: PaymentConfiguration[];
    payNow: boolean;
    paymentMethod: PaymentMethod;
    paymentConfigurationId: number | null;
    onChangePayNow: (payNow: boolean) => void;
    onChangeMethod: (method: PaymentMethod) => void;
    onChangeConfiguration: (id: number | null) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function Step3Payment({
    price,
    paymentConfigurations,
    payNow,
    paymentMethod,
    paymentConfigurationId,
    onChangePayNow,
    onChangeMethod,
    onChangeConfiguration,
    onBack,
    onNext,
}: Step3PaymentProps) {
    const canProceed = !payNow || paymentMethod === 'cash' || paymentConfigurationId !== null;

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total Pembayaran</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                        {formatCurrency(price)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => onChangePayNow(true)}
                    className={`rounded-xl border p-3 text-sm font-medium transition ${
                        payNow ? 'text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={payNow ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}
                >
                    Bayar Sekarang
                </button>
                <button
                    type="button"
                    onClick={() => onChangePayNow(false)}
                    className={`rounded-xl border p-3 text-sm font-medium transition ${
                        !payNow ? 'text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={!payNow ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}
                >
                    Bayar Nanti
                </button>
            </div>

            {payNow ? (
                <PaymentMethodSelector
                    paymentConfigurations={paymentConfigurations}
                    paymentMethod={paymentMethod}
                    paymentConfigurationId={paymentConfigurationId}
                    onChangeMethod={onChangeMethod}
                    onChangeConfiguration={onChangeConfiguration}
                />
            ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    Booking akan dibuat dengan status <strong>Belum Bayar</strong>. Pembayaran dapat diproses kemudian dari halaman detail booking.
                </div>
            )}

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed}
                    className="flex-1 rounded-xl"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    Lanjut ke Konfirmasi <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
