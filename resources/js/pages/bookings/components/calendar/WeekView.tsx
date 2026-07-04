import { Fragment } from 'react';
import { bookingCardColor, formatTime } from '../../bookingHelpers';
import { addDays, DAY_LABELS, generateHourSlots, timeToMinutes, toDateInputValue } from './calendarUtils';
import type { BookingSettings, StudioBooking } from '@/types/booking';

interface WeekViewProps {
    weekStart: Date;
    bookings: StudioBooking[];
    bookingSettings: BookingSettings;
    onSelectBooking: (booking: StudioBooking) => void;
    onSelectEmptySlot: (date: string, startTime: string, endTime: string) => void;
}

export default function WeekView({ weekStart, bookings, bookingSettings, onSelectBooking, onSelectEmptySlot }: WeekViewProps) {
    const slots = generateHourSlots(bookingSettings);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = toDateInputValue(new Date());

    const bookingsByDate = (date: string) => bookings.filter((b) => b.booking_date === date && b.status !== 'cancelled');

    return (
        <div className="overflow-x-auto rounded-2xl bg-white p-3 shadow-sm">
            <div className="grid min-w-[720px] grid-cols-8 gap-1">
                <div />
                {days.map((day, i) => {
                    const dateStr = toDateInputValue(day);
                    const isToday = dateStr === today;
                    return (
                        <div key={dateStr} className={`rounded-lg px-2 py-1.5 text-center ${isToday ? 'bg-violet-50' : ''}`}>
                            <p className="text-[10px] font-medium uppercase text-gray-400">{DAY_LABELS[i]}</p>
                            <p className={`text-sm font-semibold ${isToday ? '' : 'text-gray-900'}`} style={isToday ? { color: 'var(--brand-primary)' } : {}}>
                                {day.getDate()}
                            </p>
                        </div>
                    );
                })}

                {slots.map((slot) => {
                    const slotStart = timeToMinutes(slot);
                    const slotEnd = slotStart + 60;

                    return (
                        <Fragment key={slot}>
                            <div className="flex items-start justify-end pt-1 pr-1 text-[10px] font-medium text-gray-400">
                                {slot}
                            </div>
                            {days.map((day) => {
                                const dateStr = toDateInputValue(day);
                                const dayBookings = bookingsByDate(dateStr).filter((b) => {
                                    const bStart = timeToMinutes(b.start_time);
                                    const bEnd = timeToMinutes(b.end_time);
                                    return bStart < slotEnd && bEnd > slotStart;
                                });
                                const isSlotStart = dayBookings.filter((b) => timeToMinutes(b.start_time) === slotStart);

                                return (
                                    <div key={`${dateStr}-${slot}`} className="min-h-[36px] border-t border-gray-50 py-0.5">
                                        {dayBookings.length === 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextHour = String(slotStart / 60 + 1).padStart(2, '0');
                                                    onSelectEmptySlot(dateStr, slot, `${nextHour}:00`);
                                                }}
                                                className="h-full w-full rounded-md transition hover:bg-gray-50"
                                            />
                                        ) : isSlotStart.length > 0 ? (
                                            isSlotStart.map((booking) => {
                                                const colors = bookingCardColor(booking);
                                                return (
                                                    <button
                                                        key={booking.uuid}
                                                        type="button"
                                                        onClick={() => onSelectBooking(booking)}
                                                        className={`w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] font-medium ${colors.bg} ${colors.border} ${colors.text}`}
                                                        title={`${booking.customer_name} (${formatTime(booking.start_time)}-${formatTime(booking.end_time)})`}
                                                    >
                                                        {booking.customer_name}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            dayBookings.map((booking) => {
                                                const colors = bookingCardColor(booking);
                                                return (
                                                    <button
                                                        key={booking.uuid}
                                                        type="button"
                                                        onClick={() => onSelectBooking(booking)}
                                                        className={`h-full w-full rounded-md border px-1.5 py-1 text-left opacity-60 ${colors.bg} ${colors.border}`}
                                                        title={`${booking.customer_name} (${formatTime(booking.start_time)}-${formatTime(booking.end_time)})`}
                                                    />
                                                );
                                            })
                                        )}
                                    </div>
                                );
                            })}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}
