import type { TrainingStatus } from '@/types/training';
import type { TrainingPaymentStatus, TrainingPaymentMethod } from '@/types/training-participant';
export { formatCurrency } from '@/lib/format';

export function formatTrainingDates(dates: string[]): string {
    if (!dates?.length) return '-';

    const sorted = [...dates].filter(Boolean).sort();
    const parsed = sorted.map((d) => {
        const date = new Date(`${d}T00:00:00`);
        return {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
        };
    });

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    const groups = new Map<string, number[]>();

    for (const item of parsed) {
        const key = `${item.year}-${item.month}`;
        const days = groups.get(key) ?? [];
        days.push(item.day);
        groups.set(key, days);
    }

    const formattedGroups = [...groups.entries()].map(([key, days]) => {
        const [year, month] = key.split('-').map(Number);
        const uniqueDays = [...new Set(days)].sort((a, b) => a - b);

        if (uniqueDays.length === 1) {
            return `${uniqueDays[0]} ${months[month]} ${year}`;
        }

        const ranges: Array<{ start: number; end: number }> = [];
        let start = uniqueDays[0];
        let end = uniqueDays[0];

        for (let i = 1; i < uniqueDays.length; i++) {
            if (uniqueDays[i] === end + 1) {
                end = uniqueDays[i];
            } else {
                ranges.push({ start, end });
                start = uniqueDays[i];
                end = uniqueDays[i];
            }
        }
        ranges.push({ start, end });

        if (uniqueDays.length === 2 && ranges.length === 2) {
            return `${uniqueDays[0]} & ${uniqueDays[1]} ${months[month]} ${year}`;
        }

        const parts = ranges.map((range) =>
            range.start === range.end ? String(range.start) : `${range.start}-${range.end}`,
        );

        return `${parts.join(', ')} ${months[month]} ${year}`;
    });

    return formattedGroups.join(', ');
}

export function formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(value: string): string {
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
    upcoming: 'Akan Datang',
    ongoing: 'Berjalan',
    completed: 'Selesai',
};

export const PAYMENT_STATUS_LABELS: Record<TrainingPaymentStatus, string> = {
    paid: 'Lunas',
    unpaid: 'Belum Bayar',
    pay_later: 'Bayar Nanti',
};

export const PAYMENT_METHOD_LABELS: Record<TrainingPaymentMethod, string> = {
    cash: 'Cash',
    transfer: 'Transfer Bank',
    qris: 'QRIS',
    pay_later: 'Bayar Nanti',
};

export function trainingStatusBadgeStyle(status: TrainingStatus): { backgroundColor: string; color: string } {
    switch (status) {
        case 'upcoming':
            return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
        case 'ongoing':
            return { backgroundColor: '#dcfce7', color: '#15803d' };
        case 'completed':
            return { backgroundColor: '#f3f4f6', color: '#4b5563' };
        default:
            return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
}

export function paymentBadgeStyle(status: TrainingPaymentStatus): { backgroundColor: string; color: string } {
    switch (status) {
        case 'paid':
            return { backgroundColor: '#16a34a', color: '#ffffff' };
        case 'unpaid':
            return { backgroundColor: '#ea580c', color: '#ffffff' };
        case 'pay_later':
            return { backgroundColor: '#2563eb', color: '#ffffff' };
        default:
            return { backgroundColor: '#6b7280', color: '#ffffff' };
    }
}

export function normalizePhoneDisplay(phone: string): string {
    return phone.startsWith('62') ? `+${phone}` : phone;
}
