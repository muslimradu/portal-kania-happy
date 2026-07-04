import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, RotateCcw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface TransferCardProps {
    transfer: PaymentConfiguration;
    onEdit: (transfer: PaymentConfiguration) => void;
}

export default function TransferCard({ transfer, onEdit }: TransferCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('payment-configurations.destroy', transfer.uuid), {
            onSuccess: () => setDeleteOpen(false),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        router.patch(route('payment-configurations.restore', transfer.uuid));
    };

    return (
        <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${transfer.deleted_at ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{transfer.bank_name}</h3>
                        {transfer.is_active && !transfer.deleted_at && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Aktif</span>
                        )}
                        {!transfer.is_active && !transfer.deleted_at && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Nonaktif</span>
                        )}
                        {transfer.deleted_at && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500">Dihapus</span>
                        )}
                    </div>
                    <p className="mt-0.5 font-mono text-sm text-gray-700">{transfer.account_number}</p>
                    <p className="text-xs text-gray-400">a.n {transfer.account_holder}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-4">
                {transfer.deleted_at ? (
                    <Button size="sm" variant="ghost" onClick={handleRestore} className="rounded-lg text-green-600 hover:bg-green-50">
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Pulihkan
                    </Button>
                ) : (
                    <>
                        <Button size="sm" variant="ghost" onClick={() => onEdit(transfer)} className="rounded-lg text-gray-500 hover:bg-gray-100">
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
                title="Hapus Rekening Transfer?"
                description={`Rekening "${transfer.bank_name} - ${transfer.account_number}" akan dihapus.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />
        </div>
    );
}
