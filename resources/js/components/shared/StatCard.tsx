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
    size?: 'default' | 'compact' | 'mini';
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
    size = 'default',
}: StatCardProps) {
    const isCompact = size === 'compact';
    const isMini = size === 'mini';
    const paddingClass = isMini ? 'p-3' : isCompact ? 'p-4' : 'p-6';
    const roundedClass = isMini ? 'rounded-xl' : 'rounded-2xl';

    if (loading) {
        return (
            <div className={cn('bg-white shadow-sm', roundedClass, paddingClass)}>
                <div className="flex items-center justify-between">
                    <div className={cn('animate-pulse rounded-lg bg-gray-100', isMini ? 'h-2.5 w-16' : isCompact ? 'h-3 w-20' : 'h-4 w-24')} />
                    <div className={cn('animate-pulse rounded-lg bg-gray-100', isMini ? 'h-7 w-7' : isCompact ? 'h-8 w-8' : 'h-10 w-10')} />
                </div>
                <div className={cn('animate-pulse rounded-lg bg-gray-100', isMini ? 'mt-2 h-5 w-12' : isCompact ? 'mt-3 h-6 w-14' : 'mt-4 h-8 w-16')} />
            </div>
        );
    }

    return (
        <div className={cn('bg-white shadow-sm transition hover:shadow-md', roundedClass, paddingClass)}>
            <div className="flex items-center justify-between gap-2">
                <p className={cn('font-medium text-gray-500 leading-tight', isMini ? 'text-[11px]' : isCompact ? 'text-xs' : 'text-sm')}>{title}</p>
                <div
                    className={cn(
                        'flex shrink-0 items-center justify-center rounded-lg',
                        isMini ? 'h-7 w-7' : isCompact ? 'h-8 w-8' : 'h-10 w-10',
                        colorMap[color],
                    )}
                    style={color === 'violet' ? {
                        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                        color: 'var(--brand-primary)',
                    } : undefined}
                >
                    <Icon className={isMini ? 'h-3.5 w-3.5' : isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                </div>
            </div>
            <p className={cn('font-bold text-gray-900', isMini ? 'mt-1.5 text-lg' : isCompact ? 'mt-2 text-xl' : 'mt-4 text-3xl')}>{value}</p>
            {description && (
                <p className={cn('text-gray-400', isMini ? 'mt-0.5 text-[10px]' : isCompact ? 'mt-0.5 text-xs' : 'mt-1 text-sm')}>{description}</p>
            )}
        </div>
    );
}