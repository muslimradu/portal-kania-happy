import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { CashierGymClass } from '@/types/cashier';
import { formatCurrency } from '@/lib/format';

interface GymClassCardProps {
    gymClass: CashierGymClass;
    selected: boolean;
    onSelect: () => void;
}


function resolveIcon(iconName: string, color: string): React.ReactNode {
    if (/\p{Emoji}/u.test(iconName)) {
        return <span className="text-2xl">{iconName}</span>;
    }

    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[iconName];
    if (Icon) {
        return <Icon className="h-6 w-6" style={{ color }} />;
    }

    return <span className="text-2xl">💪</span>;
}

export default function GymClassCard({ gymClass, selected, onSelect }: GymClassCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`group relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                selected ? 'border-transparent text-white' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
            style={selected ? { backgroundColor: 'var(--brand-primary)' } : {}}
        >
            {selected && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-4 w-4 text-white" />
                </div>
            )}

            <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: selected ? 'rgba(255,255,255,0.2)' : gymClass.color_label + '20' }}
            >
                {resolveIcon(gymClass.icon, selected ? '#ffffff' : gymClass.color_label)}
            </div>

            <div className="w-full">
                <p className={`truncate font-semibold ${selected ? 'text-white' : 'text-gray-900'}`}>{gymClass.name}</p>
                <p
                    className="mt-0.5 text-lg font-bold"
                    style={{ color: selected ? '#ffffff' : gymClass.color_label }}
                >
                    {formatCurrency(gymClass.price)}
                </p>
                {typeof gymClass.attendances_count === 'number' && (
                    <p className={`mt-1 text-xs ${selected ? 'text-white/80' : 'text-gray-400'}`}>
                        {gymClass.attendances_count} check-in hari ini
                    </p>
                )}
            </div>
        </button>
    );
}
