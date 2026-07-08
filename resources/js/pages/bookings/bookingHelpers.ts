import type { BookingStatus, PaymentStatus, StudioBooking } from '@/types/booking';
export { formatCurrency } from '@/lib/format';

export function formatTime(time: string): string {
    return time.slice(0, 5);
}

/**
 * Format a Date as YYYY-MM-DD using LOCAL date parts (never toISOString(),
 * which converts to UTC and shifts the date for timezones ahead of UTC).
 */
export function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function todayDateInputValue(): string {
    return toDateInputValue(new Date());
}

export function formatDateLong(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
    upcoming: 'Akan Datang',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    unpaid: 'Belum Bayar',
    paid: 'Lunas',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    transfer: 'Transfer Bank',
    qris: 'QRIS',
};

/**
 * Determine the display color for a booking card following the spec:
 * green = paid, orange = unpaid, gray = finished/cancelled.
 */
export function bookingCardColor(booking: Pick<StudioBooking, 'status' | 'payment_status'>): {
    bg: string;
    border: string;
    text: string;
    dot: string;
} {
    if (booking.status === 'cancelled') {
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-500', dot: 'bg-gray-400' };
    }

    if (booking.status === 'completed') {
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600', dot: 'bg-gray-400' };
    }

    if (booking.payment_status === 'paid') {
        return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-500' };
    }

    return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-500' };
}

export function statusBadgeStyle(status: BookingStatus): { backgroundColor: string; color: string } {
    switch (status) {
        case 'upcoming':
            return { backgroundColor: '#ede9fe', color: '#6d28d9' };
        case 'ongoing':
            return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
        case 'completed':
            return { backgroundColor: '#f3f4f6', color: '#4b5563' };
        case 'cancelled':
            return { backgroundColor: '#fee2e2', color: '#b91c1c' };
        default:
            return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
}

export function paymentBadgeStyle(status: PaymentStatus): { backgroundColor: string; color: string } {
    return status === 'paid'
        ? { backgroundColor: '#dcfce7', color: '#15803d' }
        : { backgroundColor: '#ffedd5', color: '#c2410c' };
}

export function calculateDurationMinutes(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    return minutes > 0 ? minutes : 0;
}

export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} menit`;
    if (mins === 0) return `${hours} jam`;
    return `${hours} jam ${mins} menit`;
}

export function calculatePrice(durationMinutes: number, pricePerHour: number): number {
    return Math.round((durationMinutes / 60) * pricePerHour);
}

export function normalizePhoneDisplay(phone: string): string {
    return phone.startsWith('62') ? `+${phone}` : phone;
}
