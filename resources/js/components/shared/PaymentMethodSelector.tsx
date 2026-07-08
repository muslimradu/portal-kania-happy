import { Clock, Copy, Landmark, QrCode, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import QrisPreview from '@/components/shared/QrisPreview';
import type { PaymentConfiguration } from '@/types/payment-configuration';

export type SharedPaymentMethod = 'cash' | 'transfer' | 'qris' | 'pay_later';

interface PaymentMethodSelectorProps {
    paymentConfigurations: PaymentConfiguration[];
    paymentMethod: SharedPaymentMethod;
    paymentConfigurationId: number | null;
    onChangeMethod: (method: SharedPaymentMethod) => void;
    onChangeConfiguration: (id: number | null) => void;
    includePayLater?: boolean;
    payLaterMessage?: string;
    cashMessage?: string;
}

const METHODS = [
    { value: 'cash' as const, label: 'Cash', icon: Wallet },
    { value: 'transfer' as const, label: 'Transfer', icon: Landmark },
    { value: 'qris' as const, label: 'QRIS', icon: QrCode },
    { value: 'pay_later' as const, label: 'Bayar Nanti', icon: Clock },
];

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Berhasil disalin ke clipboard');
}

export default function PaymentMethodSelector({
    paymentConfigurations,
    paymentMethod,
    paymentConfigurationId,
    onChangeMethod,
    onChangeConfiguration,
    includePayLater = false,
    payLaterMessage = 'Pembayaran dapat diproses kemudian.',
    cashMessage = 'Pembayaran tunai akan diterima langsung oleh admin.',
}: PaymentMethodSelectorProps) {
    const transferAccounts = paymentConfigurations.filter((p) => p.type === 'transfer');
    const qrisAccounts = paymentConfigurations.filter((p) => p.type === 'qris');
    const selectedConfig = paymentConfigurations.find((p) => p.id === paymentConfigurationId);
    const visibleMethods = METHODS.filter((m) => includePayLater || m.value !== 'pay_later');

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Metode Pembayaran</p>
                <div className={`grid gap-2 ${includePayLater ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                    {visibleMethods.map((method) => {
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

            {paymentMethod === 'cash' && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    {cashMessage}
                </div>
            )}

            {paymentMethod === 'pay_later' && (
                <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                    Status <strong>Bayar Nanti</strong>. {payLaterMessage}
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
                                <QrisPreview config={account} size={64} className="shrink-0" />
                                <p className="text-sm font-semibold text-gray-900">{account.name}</p>
                            </button>
                        ))
                    )}
                    {selectedConfig && (selectedConfig.qris_type === 'url' ? selectedConfig.qris_url : selectedConfig.qris_image) && (
                        <div className="flex flex-col items-center rounded-xl border border-gray-100 p-4">
                            <QrisPreview config={selectedConfig} size={176} />
                            <p className="mt-2 text-xs text-gray-400">Scan QRIS untuk membayar</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
