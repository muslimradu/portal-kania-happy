import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
    };
    color?: 'violet' | 'blue' | 'green' | 'orange' | 'red' | 'gray';
    loading?: boolean;
}

const colorMap = {
    violet: '',
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red:    'bg-red-50 text-red-600',
    gray:   'bg-gray-50 text-gray-600',
};

export default function StatCard({
    title,
    value,
    icon: Icon,
    description,
    color = 'violet',
    loading = false,
}: StatCardProps) {
    if (loading) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
                </div>
                <div className="mt-4 h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
                <div className="mt-2 h-3 w-32 animate-pulse rounded-lg bg-gray-100" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div
                    className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorMap[color])}
                    style={color === 'violet' ? {
                        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                        color: 'var(--brand-primary)',
                    } : undefined}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
            {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
            )}
        </div>
    );
}