import { ArrowLeft, ArrowRight, Copy, Landmark, QrCode, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

const METHODS = [
    { value: 'cash' as const, label: 'Cash', icon: Wallet },
    { value: 'transfer' as const, label: 'Transfer', icon: Landmark },
    { value: 'qris' as const, label: 'QRIS', icon: QrCode },
];

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Berhasil disalin ke clipboard');
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
    const transferAccounts = paymentConfigurations.filter((p) => p.type === 'transfer');
    const qrisAccounts = paymentConfigurations.filter((p) => p.type === 'qris');
    const selectedConfig = paymentConfigurations.find((p) => p.id === paymentConfigurationId);

    const canProceed = paymentMethod === 'cash' || paymentConfigurationId !== null;

    return (
        <div className="space-y-5">
            {/* Ringkasan Pembayaran */}
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

            {/* Metode Pembayaran */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Metode Pembayaran</p>
                <div className="grid grid-cols-3 gap-2">
                    {METHODS.map((method) => {
                        const Icon = method.icon;
                        const isActive = paymentMethod === method.value;
                        return (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() => {
                                    onChangeMethod(method.value);
                                    onChangeConfiguration(null);
                                }}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition ${
                                    isActive ? 'text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                style={isActive ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}
                            >
                                <Icon className="h-5 w-5" />
                                {method.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Detail Pembayaran */}
            {paymentMethod === 'cash' && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    Pembayaran tunai akan diterima langsung oleh admin. Klik lanjut untuk menyelesaikan registrasi.
                </div>
            )}

            {paymentMethod === 'transfer' && (
                <div className="space-y-2">
                    {transferAccounts.length === 0 ? (
                        <p className="text-sm text-gray-400">Belum ada rekening transfer yang dikonfigurasi.</p>
                    ) : (
                        transferAccounts.map((account) => (
                            <button
                                type="button"
                                key={account.uuid}
                                onClick={() => onChangeConfiguration(account.id)}
                                className={`w-full rounded-xl border p-4 text-left transition ${
                                    paymentConfigurationId === account.id ? 'ring-2' : 'border-gray-100 hover:border-gray-200'
                                }`}
                                style={paymentConfigurationId === account.id ? { ['--tw-ring-color' as string]: 'var(--brand-primary)' } : {}}
                            >
                                <p className="text-sm font-semibold text-gray-900">{account.bank_name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <p className="font-mono text-sm text-gray-700">{account.account_number}</p>
                                    <span
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(account.account_number ?? '');
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">a.n. {account.account_holder}</p>
                            </button>
                        ))
                    )}
                </div>
            )}

            {paymentMethod === 'qris' && (
                <div className="space-y-2">
                    {qrisAccounts.length === 0 ? (
                        <p className="text-sm text-gray-400">Belum ada QRIS yang dikonfigurasi.</p>
                    ) : (
                        qrisAccounts.map((account) => (
                            <button
                                type="button"
                                key={account.uuid}
                                onClick={() => onChangeConfiguration(account.id)}
                                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                    paymentConfigurationId === account.id ? 'ring-2' : 'border-gray-100 hover:border-gray-200'
                                }`}
                                style={paymentConfigurationId === account.id ? { ['--tw-ring-color' as string]: 'var(--brand-primary)' } : {}}
                            >
                                {account.qris_image && (
                                    <img
                                        src={`/storage/${account.qris_image}`}
                                        alt={account.name}
                                        className="h-20 w-20 shrink-0 rounded-lg border border-gray-100 object-contain"
                                    />
                                )}
                                <p className="text-sm font-semibold text-gray-900">{account.name}</p>
                            </button>
                        ))
                    )}
                    {selectedConfig?.qris_image && (
                        <div className="flex flex-col items-center rounded-xl border border-gray-100 p-4">
                            <img src={`/storage/${selectedConfig.qris_image}`} alt="QRIS" className="h-48 w-48 object-contain" />
                            <p className="mt-2 text-xs text-gray-400">Scan QRIS untuk membayar</p>
                        </div>
                    )}
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
                    Lanjut ke Ringkasan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
