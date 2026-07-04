import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface QrisCardProps {
    qris: PaymentConfiguration;
    onEdit: (qris: PaymentConfiguration) => void;
}

export default function QrisCard({ qris, onEdit }: QrisCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('payment-configurations.destroy', qris.uuid), {
            onSuccess: () => setDeleteOpen(false),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        router.patch(route('payment-configurations.restore', qris.uuid));
    };

    const handleActivate = () => {
        router.patch(route('payment-configurations.qris.activate', qris.uuid));
    };

    return (
        <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${qris.deleted_at ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{qris.name}</h3>
                        {qris.is_active && !qris.deleted_at && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                                Aktif
                            </span>
                        )}
                        {qris.deleted_at && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500">
                                Dihapus
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                        {qris.qris_type === 'url' ? `URL: ${qris.qris_url}` : 'Upload Image'}
                    </p>
                </div>

                {/* QR Preview */}
                {qris.qris_image && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100">
                        <img
                            src={`/storage/${qris.qris_image}`}
                            alt={qris.name}
                            className="h-full w-full object-contain"
                        />
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-4">
                {qris.deleted_at ? (
                    <Button size="sm" variant="ghost" onClick={handleRestore} className="rounded-lg text-green-600 hover:bg-green-50">
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Pulihkan
                    </Button>
                ) : (
                    <>
                        {!qris.is_active && (
                            <Button size="sm" variant="ghost" onClick={handleActivate} className="rounded-lg text-green-600 hover:bg-green-50">
                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                Aktifkan
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => onEdit(qris)} className="rounded-lg text-gray-500 hover:bg-gray-100">
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteOpen(true)} className="rounded-lg text-red-500 hover:bg-red-50">
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Hapus
                        </Button>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus QRIS?"
                description={`QRIS "${qris.name}" akan dihapus.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />
        </div>
    );
}
