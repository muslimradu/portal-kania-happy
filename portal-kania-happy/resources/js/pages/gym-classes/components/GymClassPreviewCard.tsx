import * as LucideIcons from 'lucide-react';

interface GymClassPreviewCardProps {
    name: string;
    price: number;
    color: string;
    icon: string;
    isActive: boolean;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function resolveIcon(iconName: string): React.ReactNode {
    // Cek apakah emoji (unicode)
    if (/\p{Emoji}/u.test(iconName)) {
        return <span className="text-2xl">{iconName}</span>;
    }

    // Cek apakah Lucide icon
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[iconName];
    if (Icon) {
        return <Icon className="h-6 w-6 text-white" />;
    }

    // Fallback
    return <span className="text-2xl">💪</span>;
}

export default function GymClassPreviewCard({
    name,
    price,
    color,
    icon,
    isActive,
}: GymClassPreviewCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    {resolveIcon(icon)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-gray-900">{name}</p>
                        <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: isActive ? '#16a34a' : '#6b7280' }}
                        >
                            {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                    <p className="mt-1 text-sm font-medium" style={{ color }}>
                        {formatCurrency(price)}
                    </p>
                </div>
            </div>
        </div>
    );
}