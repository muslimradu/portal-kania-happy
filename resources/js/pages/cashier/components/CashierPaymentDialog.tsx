import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PaymentMethodSelector from '@/components/shared/PaymentMethodSelector';
import type { TodayAttendanceRow } from '@/types/cashier';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { SharedPaymentMethod } from '@/components/shared/PaymentMethodSelector';
import { formatCurrency } from '@/lib/format';


interface CashierPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row?: TodayAttendanceRow | null;
    paymentConfigurations: PaymentConfiguration[];
}

export default function CashierPaymentDialog({
    open,
    onOpenChange,
    row,
    paymentConfigurations,
}: CashierPaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<SharedPaymentMethod>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    if (!row) return null;

    const canSubmit = paymentMethod === 'cash' || paymentConfigurationId !== null;

    const handleSubmit = () => {
        setProcessing(true);
        router.post(
            route('cashier.transactions.pay', row.uuid),
            {
                payment_method: paymentMethod,
                payment_configuration_id: paymentConfigurationId,
            },
            {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '520px' }}
                className="max-h-[90vh] overflow-y-auto"
            >
                <DialogHeader>
                    <DialogTitle>Proses Pembayaran</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                        <p className="font-semibold text-gray-900">{row.name}</p>
                        <p className="text-gray-500">{row.gym_class}</p>
                        {row.invoice_number && (
                            <p className="text-xs text-gray-400">Invoice: {row.invoice_number}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                            <span className="font-semibold text-gray-900">Total Pembayaran</span>
                            <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                                {formatCurrency(row.amount)}
                            </span>
                        </div>
                    </div>

                    <PaymentMethodSelector
                        paymentConfigurations={paymentConfigurations}
                        paymentMethod={paymentMethod}
                        paymentConfigurationId={paymentConfigurationId}
                        onChangeMethod={setPaymentMethod}
                        onChangeConfiguration={setPaymentConfigurationId}
                        includePayLater={false}
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit || processing}
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Konfirmasi Pembayaran
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
