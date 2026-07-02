import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import { Skeleton } from './LoadingSkeleton';
import { FileX } from 'lucide-react';

export interface Column<T> {
    key: string;
    header: string;
    className?: string;
    render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    loading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
}

export default function DataTable<T>({
    columns,
    data,
    keyExtractor,
    loading = false,
    emptyTitle = 'Tidak ada data',
    emptyDescription = 'Belum ada data yang tersedia.',
    className,
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <EmptyState
                icon={FileX}
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    return (
        <div className={cn('w-full overflow-auto', className)}>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400',
                                    col.className,
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr
                            key={keyExtractor(row)}
                            className="border-b border-gray-50 transition hover:bg-gray-50/50"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={cn('px-4 py-3 text-gray-700', col.className)}
                                >
                                    {col.render
                                        ? col.render(row)
                                        : String((row as any)[col.key] ?? '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}