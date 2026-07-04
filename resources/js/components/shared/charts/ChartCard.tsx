import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../LoadingSkeleton';
import EmptyState from '../EmptyState';
import { BarChart3 } from 'lucide-react';

interface ChartCardProps extends PropsWithChildren {
    title: string;
    description?: string;
    action?: ReactNode;
    loading?: boolean;
    isEmpty?: boolean;
    className?: string;
    height?: number;
}

export default function ChartCard({ title, description, action, loading, isEmpty, className, height = 260, children }: ChartCardProps) {
    return (
        <div className={cn('rounded-2xl bg-white p-5 shadow-sm', className)}>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
                </div>
                {action}
            </div>
            <div style={{ height }}>
                {loading ? (
                    <Skeleton className="h-full w-full rounded-xl" />
                ) : isEmpty ? (
                    <div className="flex h-full items-center justify-center">
                        <EmptyState icon={BarChart3} title="Belum ada data" description="Data akan tampil setelah ada transaksi." />
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
