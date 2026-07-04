import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { transferSchema, type TransferFormValues } from '@/lib/validations/payment-configuration';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface TransferFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transfer?: PaymentConfiguration;
}

export default function TransferFormDialog({ open, onOpenChange, transfer }: TransferFormDialogProps) {
    const [processing, setProcessing] = useState(false);
    const isEdit = !!transfer;

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            name:           transfer?.name           ?? '',
            bank_name:      transfer?.bank_name      ?? '',
            account_number: transfer?.account_number ?? '',
            account_holder: transfer?.account_holder ?? '',
            is_active:      transfer?.is_active      ?? true,
        },
    });

    const isActive = watch('is_active');

    const onSubmit = (data: TransferFormValues) => {
        setProcessing(true);
        const url = isEdit
            ? route('payment-configurations.transfer.update', transfer.uuid)
            : route('payment-configurations.transfer.store');

        router.post(url, data, {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ backgroundColor: 'white', width: '90vw', maxWidth: '500px' }}>
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Edit Transfer: ${transfer.bank_name}` : 'Tambah Rekening Transfer'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input placeholder="contoh: BCA Utama" className="rounded-xl" {...register('name')} />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Nama Bank</Label>
                        <Input placeholder="contoh: BCA, Mandiri, BNI" className="rounded-xl" {...register('bank_name')} />
                        {errors.bank_name && <p className="text-sm text-red-600">{errors.bank_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Nomor Rekening</Label>
                        <Input placeholder="contoh: 1234567890" className="rounded-xl font-mono" {...register('account_number')} />
                        {errors.account_number && <p className="text-sm text-red-600">{errors.account_number.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Nama Pemilik Rekening</Label>
                        <Input placeholder="contoh: Kania Happy" className="rounded-xl" {...register('account_holder')} />
                        {errors.account_holder && <p className="text-sm text-red-600">{errors.account_holder.message}</p>}
                    </div>

                    {/* Preview Card */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <p className="font-bold text-gray-900">{watch('bank_name') || 'Nama Bank'}</p>
                            <p className="mt-1 font-mono text-lg text-gray-700">{watch('account_number') || '—'}</p>
                            <p className="mt-0.5 text-sm text-gray-400">a.n {watch('account_holder') || '—'}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                                <p className="text-xs text-gray-500">Multiple rekening transfer bisa aktif bersamaan</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('is_active', !isActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={processing} className="w-full rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan Rekening</>}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
