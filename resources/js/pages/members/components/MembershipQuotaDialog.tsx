import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Membership, MembershipDetail } from '@/types/membership';

interface MembershipQuotaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    membership: Membership;
}

interface DetailFormState {
    id: number;
    class_name: string;
    color: string;
    is_unlimited: boolean;
    quota: number;
    quota_used: number;
}

function toFormState(details: MembershipDetail[]): DetailFormState[] {
    return details.map((d) => ({
        id: d.id,
        class_name: d.class_name,
        color: d.gym_class?.color_label ?? '#6b7280',
        is_unlimited: d.is_unlimited,
        quota: d.quota ?? 0,
        quota_used: d.quota_used,
    }));
}

export default function MembershipQuotaDialog({ open, onOpenChange, membership }: MembershipQuotaDialogProps) {
    const [details, setDetails] = useState<DetailFormState[]>(() => toFormState(membership.details));
    const [processing, setProcessing] = useState(false);

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) setDetails(toFormState(membership.details));
        onOpenChange(isOpen);
    };

    const updateDetail = (id: number, patch: Partial<DetailFormState>) => {
        setDetails((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    };

    const handleSubmit = () => {
        setProcessing(true);
        router.patch(
            route('memberships.update-quota', membership.uuid),
            {
                details: details.map((d) => ({
                    id: d.id,
                    is_unlimited: d.is_unlimited,
                    quota: d.is_unlimited ? null : d.quota,
                    quota_used: d.quota_used,
                })),
            },
            {
                onSuccess: () => handleOpenChange(false),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '480px' }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Kuota: {membership.package_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {details.map((detail) => (
                        <div key={detail.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: detail.color }} />
                                    {detail.class_name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => updateDetail(detail.id, { is_unlimited: !detail.is_unlimited })}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        detail.is_unlimited ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                    title="Unlimited"
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${detail.is_unlimited ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {!detail.is_unlimited && (
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Total Kuota</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            className="rounded-lg bg-white"
                                            value={detail.quota}
                                            onChange={(e) => updateDetail(detail.id, { quota: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Sudah Dipakai</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            className="rounded-lg bg-white"
                                            value={detail.quota_used}
                                            onChange={(e) => updateDetail(detail.id, { quota_used: Number(e.target.value) })}
                                        />
                                    </div>
                                    {detail.quota_used > detail.quota && (
                                        <p className="col-span-2 text-xs text-red-600">Pemakaian tidak boleh melebihi total kuota.</p>
                                    )}
                                </div>
                            )}

                            {detail.is_unlimited && (
                                <p className="mt-2 text-xs text-gray-400">Kelas ini unlimited, tidak ada batas kuota.</p>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="w-full rounded-xl"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    {processing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Simpan Kuota</>
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
