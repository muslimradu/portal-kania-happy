interface PaginationProps {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
    itemLabel?: string;
    summaryFormat?: 'default' | 'compact';
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    lastPage,
    from,
    to,
    total,
    itemLabel = 'data',
    summaryFormat = 'default',
    onPageChange,
}: PaginationProps) {
    if (lastPage <= 1) return null;

    const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
        (page) => page === 1 || page === lastPage || Math.abs(page - currentPage) <= 1,
    );

    const summaryText = summaryFormat === 'compact'
        ? `${from ?? 0}-${to ?? 0}/${total}`
        : `Menampilkan ${from ?? 0}–${to ?? 0} dari ${total} ${itemLabel}`;

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
            <p className="text-sm text-gray-500">{summaryText}</p>
            <div className="flex items-center gap-1">
                {pages.map((page, idx) => (
                    <span key={page} className="flex items-center">
                        {idx > 0 && pages[idx - 1] !== page - 1 && <span className="px-1 text-gray-300">…</span>}
                        <button
                            onClick={() => onPageChange(page)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                                page === currentPage ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={page === currentPage ? { backgroundColor: 'var(--brand-primary)' } : {}}
                        >
                            {page}
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
