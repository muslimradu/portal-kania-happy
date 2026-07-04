import { addDays, DAY_LABELS, startOfMonth, startOfWeek, toDateInputValue } from './calendarUtils';
import type { StudioBooking } from '@/types/booking';

interface MonthViewProps {
    monthDate: Date;
    bookings: StudioBooking[];
    onSelectDay: (date: Date) => void;
}

export default function MonthView({ monthDate, bookings, onSelectDay }: MonthViewProps) {
    const firstDay = startOfWeek(startOfMonth(monthDate));
    const days = Array.from({ length: 42 }, (_, i) => addDays(firstDay, i));
    const today = toDateInputValue(new Date());

    const bookingsByDate = (date: string) => bookings.filter((b) => b.booking_date === date && b.status !== 'cancelled');

    return (
        <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map((label) => (
                    <div key={label} className="px-2 py-1 text-center text-[10px] font-semibold uppercase text-gray-400">
                        {label.slice(0, 3)}
                    </div>
                ))}

                {days.map((day) => {
                    const dateStr = toDateInputValue(day);
                    const isCurrentMonth = day.getMonth() === monthDate.getMonth();
                    const isToday = dateStr === today;
                    const dayBookings = bookingsByDate(dateStr);
                    const paidCount = dayBookings.filter((b) => b.payment_status === 'paid').length;
                    const unpaidCount = dayBookings.filter((b) => b.payment_status === 'unpaid').length;

                    return (
                        <button
                            key={dateStr}
                            type="button"
                            onClick={() => onSelectDay(day)}
                            className={`flex min-h-[76px] flex-col items-start rounded-lg border p-2 text-left transition hover:border-gray-300 ${
                                isCurrentMonth ? 'border-gray-100 bg-white' : 'border-gray-50 bg-gray-50/50 text-gray-300'
                            }`}
                        >
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}
                                style={isToday ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                {day.getDate()}
                            </span>
                            {dayBookings.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    {paidCount > 0 && (
                                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">{paidCount} lunas</span>
                                    )}
                                    {unpaidCount > 0 && (
                                        <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">{unpaidCount} belum bayar</span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
