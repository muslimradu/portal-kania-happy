import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MembershipPackage } from '@/types/membership-package';
import { formatCurrency } from '@/lib/format';
import { detailsToGroups, formatGroupLabel } from '@/lib/membership-package-groups';

interface Step2SelectPackageProps {
    packages: MembershipPackage[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    onBack: () => void;
    onNext: () => void;
}


function formatExpired(type: string, duration: number | null): string {
    if (type === 'manual') return 'Manual';
    if (!duration) return '-';
    const labels: Record<string, string> = { days: 'Hari', weeks: 'Minggu', months: 'Bulan', years: 'Tahun' };
    return `${duration} ${labels[type] ?? type}`;
}

export default function Step2SelectPackage({ packages, selectedIds, onToggle, onBack, onNext }: Step2SelectPackageProps) {
    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500">Pilih satu atau lebih paket membership untuk member ini.</p>

            {packages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                    Belum ada paket membership aktif. Tambahkan paket terlebih dahulu.
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {packages.map((pkg) => {
                        const isSelected = selectedIds.includes(pkg.id);
                        return (
                            <button
                                type="button"
                                key={pkg.uuid}
                                onClick={() => onToggle(pkg.id)}
                                className={`relative rounded-2xl border p-4 text-left shadow-sm transition ${
                                    isSelected
                                        ? 'border-transparent ring-2'
                                        : 'border-gray-100 hover:border-gray-200'
                                }`}
                                style={isSelected ? { ['--tw-ring-color' as string]: 'var(--brand-primary)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 6%, white)' } : {}}
                            >
                                {isSelected && (
                                    <div
                                        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white"
                                        style={{ backgroundColor: 'var(--brand-primary)' }}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                )}
                                <p className="pr-6 font-semibold text-gray-900">{pkg.name}</p>
                                <p className="mt-0.5 text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                                    {formatCurrency(pkg.price)}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">Masa aktif: {formatExpired(pkg.expired_type, pkg.expired_duration)} (dari check-in pertama)</p>
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {detailsToGroups(pkg.details.map((detail) => ({
                                        gym_class_id: detail.gym_class_id,
                                        quota: detail.quota,
                                        is_unlimited: detail.is_unlimited,
                                        quota_group: detail.quota_group,
                                    }))).map((group, index) => (
                                        <span
                                            key={index}
                                            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                            style={{ backgroundColor: pkg.details.find((detail) => detail.gym_class_id === group.gym_class_ids[0])?.gym_class?.color_label ?? '#6b7280' }}
                                        >
                                            {formatGroupLabel(group, group.gym_class_ids.map((id) => pkg.details.find((detail) => detail.gym_class_id === id)?.gym_class?.name ?? 'Kelas'))}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={selectedIds.length === 0}
                    className="flex-1 rounded-xl"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    Lanjut ke Pembayaran <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
