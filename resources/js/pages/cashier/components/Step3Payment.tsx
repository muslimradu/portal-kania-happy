import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentMethodSelector from '@/components/shared/PaymentMethodSelector';
import { formatCurrency } from '@/lib/format';
import type { CashierGymClass, CashierPaymentMethod, CustomerType } from '@/types/cashier';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface Step3PaymentProps {
    gymClass: CashierGymClass;
    customerType: CustomerType;
    paymentConfigurations: PaymentConfiguration[];
    paymentMethod: CashierPaymentMethod;
    paymentConfigurationId: number | null;
    onChangeMethod: (method: CashierPaymentMethod) => void;
    onChangeConfiguration: (id: number | null) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function Step3Payment({
    gymClass,
    customerType,
    paymentConfigurations,
    paymentMethod,
    paymentConfigurationId,
    onChangeMethod,
    onChangeConfiguration,
    onBack,
    onNext,
}: Step3PaymentProps) {
    if (customerType === 'member') {
        return (
            <div className="space-y-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Pembayaran</h2>
                    <p className="text-sm text-gray-500">Member tidak memerlukan pembayaran, kuota akan dipotong otomatis.</p>
                </div>

                <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
                    <ShieldCheck className="h-10 w-10 text-green-600" />
                    <p className="font-semibold text-green-700">Tidak perlu pembayaran</p>
                    <p className="text-sm text-green-600">Kuota membership akan dipotong setelah check-in selesai.</p>
                    <p className="mt-2 text-3xl font-bold text-green-700">{formatCurrency(0)}</p>
                </div>

                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1 rounded-xl">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                    <Button type="button" onClick={onNext} className="flex-1 rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    const canProceed = paymentMethod === 'cash' || paymentMethod === 'pay_later' || paymentConfigurationId !== null;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Pembayaran</h2>
                <p className="text-sm text-gray-500">Pilih metode pembayaran untuk transaksi non member.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{gymClass.name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(gymClass.price)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                        {formatCurrency(gymClass.price)}
                    </span>
                </div>
            </div>

            <PaymentMethodSelector
                paymentConfigurations={paymentConfigurations}
                paymentMethod={paymentMethod}
                paymentConfigurationId={paymentConfigurationId}
                onChangeMethod={onChangeMethod}
                onChangeConfiguration={onChangeConfiguration}
                includePayLater
                payLaterMessage="Customer akan dicatat hadir. Pembayaran dapat diproses dari daftar hadir hari ini."
                cashMessage="Pembayaran tunai akan diterima langsung oleh admin. Klik lanjut untuk menyelesaikan transaksi."
            />

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
                    Lanjut ke Ringkasan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
