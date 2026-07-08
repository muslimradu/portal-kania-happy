import { useMemo, useState } from 'react';
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
import { formatIsoDateToDdMmYyyy, parseDdMmYyyyToIso } from '@/lib/format';
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

type ExpiredType = 'manual' | 'days' | 'weeks' | 'months' | 'years';

const EXPIRED_TYPE_OPTIONS: { value: ExpiredType; label: string }[] = [
    { value: 'manual', label: 'Manual' },
    { value: 'days', label: 'Hari' },
    { value: 'weeks', label: 'Minggu' },
    { value: 'months', label: 'Bulan' },
    { value: 'years', label: 'Tahun' },
];

function toFormState(details: MembershipDetail[]): DetailFormState[] {
    return details
        .filter((detail) => detail.quota_group == null || detail.quota != null)
        .map((detail) => ({
            id: detail.id,
            class_name: detail.quota_group
                ? details.filter((item) => item.quota_group === detail.quota_group).map((item) => item.class_name).join(' & ')
                : detail.class_name,
            color: detail.gym_class?.color_label ?? '#6b7280',
            is_unlimited: detail.is_unlimited,
            quota: detail.quota ?? 0,
            quota_used: detail.quota_used,
        }));
}

function toDateInputValue(value: string | null): string {
    if (!value) return '';
    return value.slice(0, 10);
}

function toIsoDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDuration(startDate: string, type: ExpiredType, duration: number): string {
    const date = new Date(`${startDate}T00:00:00`);
    switch (type) {
        case 'days':
            date.setDate(date.getDate() + duration);
            break;
        case 'weeks':
            date.setDate(date.getDate() + duration * 7);
            break;
        case 'months':
            date.setMonth(date.getMonth() + duration);
            break;
        case 'years':
            date.setFullYear(date.getFullYear() + duration);
            break;
        default:
            return '';
    }
    return toIsoDateLocal(date);
}

export default function MembershipQuotaDialog({ open, onOpenChange, membership }: MembershipQuotaDialogProps) {
    const packageDefaults = membership.membership_package;

    const [details, setDetails] = useState<DetailFormState[]>(() => toFormState(membership.details));
    const [startDate, setStartDate] = useState(() => toDateInputValue(membership.start_date));
    const [endDate, setEndDate] = useState(() => formatIsoDateToDdMmYyyy(membership.end_date));
    const [expiredType, setExpiredType] = useState<ExpiredType>(
        (packageDefaults?.expired_type as ExpiredType) ?? 'manual',
    );
    const [expiredDuration, setExpiredDuration] = useState<number>(packageDefaults?.expired_duration ?? 1);
    const [processing, setProcessing] = useState(false);

    const computedEndDate = useMemo(() => {
        if (!startDate || expiredType === 'manual') return '';
        return addDuration(startDate, expiredType, expiredDuration);
    }, [startDate, expiredType, expiredDuration]);

    const resetForm = () => {
        setDetails(toFormState(membership.details));
        setStartDate(toDateInputValue(membership.start_date));
        setEndDate(formatIsoDateToDdMmYyyy(membership.end_date));
        setExpiredType((packageDefaults?.expired_type as ExpiredType) ?? 'manual');
        setExpiredDuration(packageDefaults?.expired_duration ?? 1);
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) resetForm();
        onOpenChange(isOpen);
    };

    const updateDetail = (id: number, patch: Partial<DetailFormState>) => {
        setDetails((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    };

    const handleSubmit = () => {
        setProcessing(true);
        const manualEndIso = parseDdMmYyyyToIso(endDate);

        router.patch(
            route('memberships.update-quota', membership.uuid),
            {
                details: details.map((d) => ({
                    id: d.id,
                    is_unlimited: d.is_unlimited,
                    quota: d.is_unlimited ? null : d.quota,
                    quota_used: d.quota_used,
                })),
                start_date: startDate || null,
                end_date: expiredType === 'manual' ? manualEndIso : (computedEndDate || manualEndIso),
                expired_type: expiredType,
                expired_duration: expiredType === 'manual' ? null : expiredDuration,
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
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '520px' }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Paket: {membership.package_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Masa Expired</p>

                        {!startDate && (
                            <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                                Membership belum aktif. Isi tanggal mulai untuk mengatur masa expired secara manual.
                            </p>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="membership-start-date">Tanggal Mulai</Label>
                            <Input
                                id="membership-start-date"
                                type="date"
                                className="rounded-lg bg-white"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="membership-expired-type">Tipe Expired</Label>
                                <select
                                    id="membership-expired-type"
                                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={expiredType}
                                    onChange={(e) => setExpiredType(e.target.value as ExpiredType)}
                                >
                                    {EXPIRED_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {expiredType !== 'manual' && (
                                <div className="space-y-2">
                                    <Label htmlFor="membership-expired-duration">Durasi</Label>
                                    <Input
                                        id="membership-expired-duration"
                                        type="number"
                                        min="1"
                                        className="rounded-lg bg-white"
                                        value={expiredDuration}
                                        onChange={(e) => setExpiredDuration(Number(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>

                        {expiredType === 'manual' ? (
                            <div className="space-y-2">
                                <Label htmlFor="membership-end-date">Tanggal Berakhir</Label>
                                <Input
                                    id="membership-end-date"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="DD-MM-YYYY"
                                    className="rounded-lg bg-white"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <p className="text-xs text-gray-400">Format DD-MM-YYYY. Kosongkan untuk paket tanpa batas waktu.</p>
                            </div>
                        ) : startDate && computedEndDate ? (
                            <p className="text-xs text-gray-500">
                                Tanggal berakhir:{' '}
                                <span className="font-medium text-gray-800">{formatIsoDateToDdMmYyyy(computedEndDate)}</span>
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400">Tanggal berakhir dihitung otomatis setelah tanggal mulai diisi.</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Kuota Kelas</p>
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
                        <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
