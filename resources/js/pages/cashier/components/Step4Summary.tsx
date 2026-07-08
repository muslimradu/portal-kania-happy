import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CashierGymClass, CashierMember, CashierPaymentMethod, CustomerType, NonMemberInfo } from '@/types/cashier';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import { formatCurrency } from '@/lib/format';

interface Step4SummaryProps {
    gymClass: CashierGymClass;
    customerType: CustomerType;
    nonMemberInfo: NonMemberInfo;
    selectedMember: CashierMember | null;
    paymentMethod: CashierPaymentMethod;
    paymentConfiguration: PaymentConfiguration | null;
    processing: boolean;
    quotaError?: string | null;
    onBack: () => void;
    onSubmit: () => void;
}


const METHOD_LABELS: Record<string, string> = { cash: 'Cash', transfer: 'Transfer', qris: 'QRIS', pay_later: 'Bayar Nanti' };

export default function Step4Summary({
    gymClass,
    customerType,
    nonMemberInfo,
    selectedMember,
    paymentMethod,
    paymentConfiguration,
    processing,
    quotaError,
    onBack,
    onSubmit,
}: Step4SummaryProps) {
    const isMember = customerType === 'member';
    const isPayLater = !isMember && paymentMethod === 'pay_later';
    const total = isMember ? 0 : Number(gymClass.price);
    const customerName = isMember ? selectedMember?.name ?? '-' : nonMemberInfo.name;
    const today = new Date();
    const invoicePreviewPrefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Ringkasan Transaksi</h2>
                <p className="text-sm text-gray-500">Periksa kembali detail sebelum menyelesaikan.</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <SummaryRow label="Jenis Transaksi" value={isMember ? 'Member' : 'Non Member'} />
                <SummaryRow label="Nama" value={customerName} />
                <SummaryRow label="Jenis Senam" value={gymClass.name} />
                {!isMember && <SummaryRow label="Metode" value={METHOD_LABELS[paymentMethod]} />}
                {!isMember && paymentConfiguration && paymentMethod !== 'pay_later' && (
                    <SummaryRow label="Tujuan Pembayaran" value={paymentConfiguration.name} />
                )}
                <SummaryRow label="Invoice" value={isMember ? '-' : `${invoicePreviewPrefix}-XXXX (preview)`} />
            </div>

            <div
                className="flex flex-col items-center gap-1 rounded-2xl p-6 text-center text-white"
                style={{ backgroundColor: isPayLater ? '#d97706' : 'var(--brand-primary)' }}
            >
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                    {isPayLater ? 'Total Tagihan' : 'Total Pembayaran'}
                </p>
                <p className="text-4xl font-bold">{formatCurrency(total)}</p>
                {isMember && <p className="mt-1 text-xs text-white/80">Kuota membership akan dipotong otomatis</p>}
                {isPayLater && (
                    <p className="mt-1 text-xs text-white/90">Pembayaran dapat dilakukan nanti dari daftar hadir</p>
                )}
            </div>

            {quotaError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{quotaError}</div>
            )}

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
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isMember ? 'Selesaikan Check In' : isPayLater ? 'Catat & Bayar Nanti' : 'Selesaikan Transaksi'}
                </Button>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
