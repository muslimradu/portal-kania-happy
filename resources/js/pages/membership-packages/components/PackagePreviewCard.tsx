import * as LucideIcons from 'lucide-react';
import { formatGroupLabel, type PackageGroup } from '@/lib/membership-package-groups';
import type { GymClass } from '@/types/gym-class';
import { formatCurrency } from '@/lib/format';

interface PackagePreviewCardProps {
    name: string;
    price: number;
    expiredType: string;
    expiredDuration: number | null;
    groups: PackageGroup[];
    gymClasses: GymClass[];
}

function formatExpired(type: string, duration: number | null): string {
    if (type === 'manual') return 'Manual';
    if (!duration) return '-';
    const labels: Record<string, string> = {
        days: 'Hari',
        weeks: 'Minggu',
        months: 'Bulan',
        years: 'Tahun',
    };
    return `${duration} ${labels[type] ?? type}`;
}

export default function PackagePreviewCard({
    name,
    price,
    expiredType,
    expiredDuration,
    groups,
    gymClasses,
}: PackagePreviewCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 border-b border-gray-50 pb-4">
                <h3 className="font-bold text-gray-900">{name || 'Nama Paket'}</h3>
                <p className="mt-1 truncate text-base font-semibold" style={{ color: 'var(--brand-primary)' }}>
                    {formatCurrency(price || 0)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    Expired: {formatExpired(expiredType, expiredDuration)}
                </p>
            </div>

            {groups.length === 0 ? (
                <p className="text-center text-xs text-gray-300">Belum ada kelas ditambahkan</p>
            ) : (
                <div className="space-y-2">
                    {groups.map((group, index) => {
                        const classNames = group.gym_class_ids.map((id) => gymClasses.find((g) => g.id === id)?.name ?? 'Kelas');
                        const primaryClass = gymClasses.find((g) => g.id === group.gym_class_ids[0]);
                        const Icon = primaryClass
                            ? (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[primaryClass.icon]
                            : null;

                        return (
                            <div key={index} className="flex items-center gap-3 rounded-xl p-2" style={{ backgroundColor: (primaryClass?.color_label ?? '#6b7280') + '10' }}>
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: (primaryClass?.color_label ?? '#6b7280') + '20' }}
                                >
                                    {Icon ? (
                                        <Icon className="h-4 w-4" style={{ color: primaryClass?.color_label }} />
                                    ) : (
                                        <span className="text-sm">{primaryClass?.icon ?? '•'}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{formatGroupLabel(group, classNames)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
