import { bookingCardColor, formatTime } from '../../bookingHelpers';
import { generateHourSlots, timeToMinutes, toDateInputValue } from './calendarUtils';
import type { BookingSettings, StudioBooking } from '@/types/booking';

interface TimelineViewProps {
    date: Date;
    bookings: StudioBooking[];
    bookingSettings: BookingSettings;
    onSelectBooking: (booking: StudioBooking) => void;
    onSelectEmptySlot: (date: string, startTime: string, endTime: string) => void;
}

export default function TimelineView({ date, bookings, bookingSettings, onSelectBooking, onSelectEmptySlot }: TimelineViewProps) {
    const slots = generateHourSlots(bookingSettings);
    const dateStr = toDateInputValue(date);
    const dayStart = timeToMinutes(bookingSettings.operating_hours.start);
    const dayEnd = timeToMinutes(bookingSettings.operating_hours.end);
    const totalMinutes = dayEnd - dayStart;
    const activeBookings = bookings.filter((b) => b.status !== 'cancelled');

    return (
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
            {/* Hour axis */}
            <div className="relative ml-14 flex border-b border-gray-100 pb-2">
                {slots.map((slot) => (
                    <div key={slot} className="flex-1 text-center text-[10px] font-medium text-gray-400">
                        {slot}
                    </div>
                ))}
            </div>

            {/* Track */}
            <div className="flex items-center gap-3">
                <div className="w-11 shrink-0 text-xs font-medium text-gray-400">Studio</div>
                <div className="relative h-14 flex-1 rounded-xl bg-gray-50">
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 flex">
                        {slots.map((slot) => (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                    const [h] = slot.split(':').map(Number);
                                    onSelectEmptySlot(dateStr, slot, `${String(h + 1).padStart(2, '0')}:00`);
                                }}
                                className="flex-1 border-r border-dashed border-gray-200 transition last:border-r-0 hover:bg-gray-100"
                            />
                        ))}
                    </div>

                    {/* Booking bars */}
                    {activeBookings.map((booking) => {
                        const bStart = Math.max(timeToMinutes(booking.start_time), dayStart);
                        const bEnd = Math.min(timeToMinutes(booking.end_time), dayEnd);
                        const left = ((bStart - dayStart) / totalMinutes) * 100;
                        const width = ((bEnd - bStart) / totalMinutes) * 100;
                        const colors = bookingCardColor(booking);

                        return (
                            <button
                                key={booking.uuid}
                                type="button"
                                onClick={() => onSelectBooking(booking)}
                                className={`absolute top-1 bottom-1 flex items-center justify-center overflow-hidden rounded-lg border px-2 text-xs font-medium transition hover:z-10 hover:shadow-md ${colors.bg} ${colors.border} ${colors.text}`}
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={`${booking.customer_name} (${formatTime(booking.start_time)}-${formatTime(booking.end_time)})`}
                            >
                                <span className="truncate">{booking.customer_name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Lunas
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Belum Bayar
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> Selesai
                </div>
            </div>
        </div>
    );
}
