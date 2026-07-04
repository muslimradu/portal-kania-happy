import type { BookingSettings } from '@/types/booking';

/**
 * Generate hourly slot labels (e.g. "08:00") between operating hours, one per hour.
 */
export function generateHourSlots(bookingSettings: BookingSettings): string[] {
    const [startHour] = bookingSettings.operating_hours.start.split(':').map(Number);
    const [endHour] = bookingSettings.operating_hours.end.split(':').map(Number);

    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
}

/**
 * Format a Date as YYYY-MM-DD using LOCAL date parts (never use toISOString()
 * here, since it converts to UTC and shifts the date for timezones ahead of
 * UTC, e.g. Asia/Jakarta at UTC+7 would roll back to the previous day).
 */
export function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as first day
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function addDays(date: Date, amount: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function timeToMinutes(time: string): number {
    const [h, m] = time.slice(0, 5).split(':').map(Number);
    return h * 60 + m;
}

export const DAY_LABELS = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu'];
export const MONTH_LABELS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
