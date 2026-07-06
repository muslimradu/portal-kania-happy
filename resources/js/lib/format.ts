export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatDateShort(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatIsoDateToDdMmYyyy(iso: string | null | undefined): string {
    if (!iso) return '';
    const [year, month, day] = iso.slice(0, 10).split('-');
    if (!year || !month || !day) return '';
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
}

export function parseDdMmYyyyToIso(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
}

export function formatDateTime(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatTime(time: string | null | undefined): string {
    if (!time) return '-';
    return time.slice(0, 5);
}

/**
 * Appends a plain query string to a URL. Used for export links where filters
 * are dynamic and don't map to Ziggy's strictly-typed named route parameters.
 */
export function withQuery(url: string, params: Record<string, unknown>): string {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value));
        }
    });
    const qs = search.toString();
    return qs ? `${url}?${qs}` : url;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    transfer: 'Transfer',
    qris: 'QRIS',
};
