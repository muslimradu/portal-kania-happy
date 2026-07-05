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
import TrainingPaymentMethodSelector from './TrainingPaymentMethodSelector';
import { formatCurrency } from '@/pages/trainings/trainingHelpers';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { TrainingParticipant, TrainingPaymentMethod } from '@/types/training-participant';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    participant?: TrainingParticipant;
    paymentConfigurations: PaymentConfiguration[];
}

export default function PaymentDialog({
    open,
    onOpenChange,
    participant,
    paymentConfigurations,
}: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<TrainingPaymentMethod>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    if (!participant) return null;

    const canSubmit = paymentMethod === 'cash' || paymentConfigurationId !== null;

    const handleSubmit = () => {
        setProcessing(true);
        router.post(
            route('training-participants.pay', participant.uuid),
            {
                payment_method: paymentMethod,
                payment_configuration_id: paymentConfigurationId,
            },
            {
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
                        <p className="font-semibold text-gray-900">{participant.full_name}</p>
                        <p className="text-gray-500">{participant.training?.title}</p>
                        {participant.invoice_number && (
                            <p className="text-xs text-gray-400">Invoice: {participant.invoice_number}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                            <span className="font-semibold text-gray-900">Total Pembayaran</span>
                            <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                                {formatCurrency(participant.amount)}
                            </span>
                        </div>
                    </div>

                    <TrainingPaymentMethodSelector
                        paymentConfigurations={paymentConfigurations}
                        paymentMethod={paymentMethod}
                        paymentConfigurationId={paymentConfigurationId}
                        onChangeMethod={setPaymentMethod}
                        onChangeConfiguration={setPaymentConfigurationId}
                        includePayLater={false}
                    />
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing || !canSubmit}
                        className="rounded-xl"
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
