import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Upload, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { qrisSchema, type QrisFormValues } from '@/lib/validations/payment-configuration';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface QrisFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    qris?: PaymentConfiguration;
}

export default function QrisFormDialog({ open, onOpenChange, qris }: QrisFormDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(
        qris?.qris_image ? `/storage/${qris.qris_image}` : null
    );
    const fileRef = useRef<HTMLInputElement>(null);
    const isEdit = !!qris;

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<QrisFormValues>({
        resolver: zodResolver(qrisSchema),
        defaultValues: {
            name:      qris?.name      ?? '',
            qris_type: qris?.qris_type ?? 'upload',
            qris_url:  qris?.qris_url  ?? null,
            is_active: qris?.is_active ?? true,
        },
    });

    const qrisType = watch('qris_type');
    const isActive = watch('is_active');

    const onSubmit = (data: QrisFormValues) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('qris_type', data.qris_type);
        formData.append('is_active', data.is_active ? '1' : '0');

        if (data.qris_type === 'url' && data.qris_url) {
            formData.append('qris_url', data.qris_url);
        }

        if (data.qris_type === 'upload' && fileRef.current?.files?.[0]) {
            formData.append('qris_image_file', fileRef.current.files[0]);
        }

        const url = isEdit
            ? route('payment-configurations.qris.update', qris.uuid)
            : route('payment-configurations.qris.store');

        router.post(url, formData, {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ backgroundColor: 'white', width: '90vw', maxWidth: '600px' }}>
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Edit QRIS: ${qris.name}` : 'Tambah QRIS'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label>Nama QRIS</Label>
                        <Input placeholder="contoh: QRIS Kania Happy" className="rounded-xl" {...register('name')} />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    {/* Tipe QRIS */}
                    <div className="space-y-2">
                        <Label>Tipe QRIS</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'upload', label: 'Upload Gambar', icon: Upload },
                                { value: 'url', label: 'Generate dari URL', icon: Link },
                            ].map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setValue('qris_type', opt.value as 'upload' | 'url')}
                                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                                            qrisType === opt.value
                                                ? 'border-current text-white'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                        style={qrisType === opt.value ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upload */}
                    {qrisType === 'upload' && (
                        <div className="space-y-2">
                            <Label>Gambar QR Code</Label>
                            <div className="flex items-center gap-4">
                                {imagePreview && (
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100">
                                        <img src={imagePreview} alt="QR Preview" className="h-full w-full object-contain" />
                                    </div>
                                )}
                                <Input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    className="rounded-xl"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setImagePreview(URL.createObjectURL(file));
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* URL */}
                    {qrisType === 'url' && (
                        <div className="space-y-2">
                            <Label>URL QRIS</Label>
                            <Input
                                placeholder="https://example.com/qris"
                                className="rounded-xl"
                                {...register('qris_url')}
                            />
                            {errors.qris_url && <p className="text-sm text-red-600">{errors.qris_url.message}</p>}
                            <p className="text-xs text-gray-400">QR Code akan di-generate otomatis dari URL ini.</p>
                        </div>
                    )}

                    {/* Status */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                                <p className="text-xs text-gray-500">Hanya satu QRIS yang bisa aktif</p>
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
                        {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan QRIS</>}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
