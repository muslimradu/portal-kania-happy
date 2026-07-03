import * as LucideIcons from 'lucide-react';
import type { MembershipPackageDetailFormValues } from '@/lib/validations/membership-package';
import type { GymClass } from '@/types/gym-class';

interface PackagePreviewCardProps {
    name: string;
    price: number;
    expiredType: string;
    expiredDuration: number | null;
    details: MembershipPackageDetailFormValues[];
    gymClasses: GymClass[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
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
    details,
    gymClasses,
}: PackagePreviewCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 border-b border-gray-50 pb-4">
                <h3 className="font-bold text-gray-900">{name || 'Nama Paket'}</h3>
                <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--brand-primary)' }}>
                    {formatCurrency(price || 0)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    Expired: {formatExpired(expiredType, expiredDuration)}
                </p>
            </div>

            {details.length === 0 ? (
                <p className="text-center text-xs text-gray-300">Belum ada kelas ditambahkan</p>
            ) : (
                <div className="space-y-2">
                    {details.map((detail, index) => {
                        const gymClass = gymClasses.find((g) => g.id === detail.gym_class_id);
                        if (!gymClass) return null;

                        const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[gymClass.icon];

                        return (
                            <div key={index} className="flex items-center gap-3 rounded-xl p-2" style={{ backgroundColor: gymClass.color_label + '10' }}>
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: gymClass.color_label + '20' }}
                                >
                                    {Icon ? (
                                        <Icon className="h-4 w-4" style={{ color: gymClass.color_label }} />
                                    ) : (
                                        <span className="text-sm">{gymClass.icon}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{gymClass.name}</p>
                                </div>
                                <span
                                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                    style={{ backgroundColor: gymClass.color_label }}
                                >
                                    {detail.is_unlimited ? '∞' : `${detail.quota}x`}
                              </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
