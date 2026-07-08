import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentMethodSelector from '@/components/shared/PaymentMethodSelector';
import { formatCurrency } from '@/lib/format';
import type { MembershipPackage } from '@/types/membership-package';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface Step3PaymentProps {
    selectedPackages: MembershipPackage[];
    paymentConfigurations: PaymentConfiguration[];
    paymentMethod: 'cash' | 'transfer' | 'qris';
    paymentConfigurationId: number | null;
    onChangeMethod: (method: 'cash' | 'transfer' | 'qris') => void;
    onChangeConfiguration: (id: number | null) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function Step3Payment({
    selectedPackages,
    paymentConfigurations,
    paymentMethod,
    paymentConfigurationId,
    onChangeMethod,
    onChangeConfiguration,
    onBack,
    onNext,
}: Step3PaymentProps) {
    const totalPrice = selectedPackages.reduce((sum, pkg) => sum + Number(pkg.price), 0);
    const canProceed = paymentMethod === 'cash' || paymentConfigurationId !== null;

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Ringkasan Pembayaran</p>
                <div className="mt-2 space-y-1">
                    {selectedPackages.map((pkg) => (
                        <div key={pkg.uuid} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{pkg.name}</span>
                            <span className="font-medium text-gray-900">{formatCurrency(Number(pkg.price))}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                        {formatCurrency(totalPrice)}
                    </span>
                </div>
            </div>

            <PaymentMethodSelector
                paymentConfigurations={paymentConfigurations}
                paymentMethod={paymentMethod}
                paymentConfigurationId={paymentConfigurationId}
                onChangeMethod={onChangeMethod}
                onChangeConfiguration={onChangeConfiguration}
                cashMessage="Pembayaran tunai akan diterima langsung oleh admin. Klik lanjut untuk menyelesaikan registrasi."
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
