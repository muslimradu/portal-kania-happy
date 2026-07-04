import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MembershipPackage } from '@/types/membership-package';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { RegistrationStep1Values } from '@/lib/validations/member-registration';

interface Step4SummaryProps {
    memberInfo: RegistrationStep1Values;
    selectedPackages: MembershipPackage[];
    paymentMethod: 'cash' | 'transfer' | 'qris';
    paymentConfiguration: PaymentConfiguration | null;
    processing: boolean;
    onBack: () => void;
    onSubmit: () => void;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

const PAYMENT_LABELS: Record<string, string> = { cash: 'Cash', transfer: 'Transfer Bank', qris: 'QRIS' };

export default function Step4Summary({
    memberInfo,
    selectedPackages,
    paymentMethod,
    paymentConfiguration,
    processing,
    onBack,
    onSubmit,
}: Step4SummaryProps) {
    const totalPrice = selectedPackages.reduce((sum, pkg) => sum + Number(pkg.price), 0);

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Periksa kembali data sebelum menyelesaikan pendaftaran.
            </div>

            {/* Member */}
            <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Member</p>
                <p className="mt-1 font-semibold text-gray-900">{memberInfo.name}</p>
                <p className="text-sm text-gray-500">{memberInfo.phone}</p>
                {memberInfo.address && <p className="text-sm text-gray-500">{memberInfo.address}</p>}
            </div>

            {/* Membership Details */}
            <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Paket & Membership Details</p>
                <div className="mt-2 space-y-3">
                    {selectedPackages.map((pkg) => (
                        <div key={pkg.uuid} className="rounded-xl bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{pkg.name}</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(Number(pkg.price))}</p>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {pkg.details.map((detail) => (
                                    <span
                                        key={detail.uuid}
                                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: detail.gym_class?.color_label ?? '#6b7280' }}
                                    >
                                        {detail.gym_class?.name} · {detail.is_unlimited ? 'Unlimited' : `${detail.quota}x`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pembayaran</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Metode</span>
                    <span className="font-medium text-gray-900">
                        {PAYMENT_LABELS[paymentMethod]}
                        {paymentConfiguration ? ` · ${paymentConfiguration.name}` : ''}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-900">Total Harga</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                        {formatCurrency(totalPrice)}
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
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                    ) : (
                        'Complete Registration'
                    )}
                </Button>
            </div>
        </div>
    );
}
