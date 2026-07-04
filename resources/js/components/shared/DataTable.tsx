import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import { Skeleton } from './LoadingSkeleton';
import { FileX, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
    key: string;
    header: string;
    className?: string;
    render?: (row: T) => ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    loading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
    stickyHeader?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (key: string) => void;
}

export default function DataTable<T>({
    columns,
    data,
    keyExtractor,
    loading = false,
    emptyTitle = 'Tidak ada data',
    emptyDescription = 'Belum ada data yang tersedia.',
    className,
    stickyHeader = false,
    sortBy,
    sortDir = 'asc',
    onSort,
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
                <thead className={cn(stickyHeader && 'sticky top-0 z-10 bg-white')}>
                    <tr className="border-b border-gray-100">
                        {columns.map((col) => {
                            const isSortable = col.sortable && onSort;
                            const isActive = sortBy === col.key;
                            return (
                                <th
                                    key={col.key}
                                    onClick={isSortable ? () => onSort(col.key) : undefined}
                                    className={cn(
                                        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400',
                                        isSortable && 'cursor-pointer select-none hover:text-gray-600',
                                        col.className,
                                    )}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {col.header}
                                        {isSortable && (
                                            isActive ? (
                                                sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                            ) : (
                                                <ChevronsUpDown className="h-3 w-3 opacity-40" />
                                            )
                                        )}
                                    </span>
                                </th>
                            );
                        })}
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