import { Plus } from 'lucide-react';
import { bookingCardColor, formatCurrency, formatTime } from '../../bookingHelpers';
import { generateHourSlots, timeToMinutes, toDateInputValue } from './calendarUtils';
import type { BookingSettings, StudioBooking } from '@/types/booking';

interface DayViewProps {
    date: Date;
    bookings: StudioBooking[];
    bookingSettings: BookingSettings;
    onSelectBooking: (booking: StudioBooking) => void;
    onSelectEmptySlot: (date: string, startTime: string, endTime: string) => void;
}

export default function DayView({ date, bookings, bookingSettings, onSelectBooking, onSelectEmptySlot }: DayViewProps) {
    const slots = generateHourSlots(bookingSettings);
    const dateStr = toDateInputValue(date);

    return (
        <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="divide-y divide-gray-100">
                {slots.map((slot) => {
                    const slotStart = timeToMinutes(slot);
                    const slotEnd = slotStart + 60;

                    const overlapping = bookings.filter((b) => {
                        const bStart = timeToMinutes(b.start_time);
                        const bEnd = timeToMinutes(b.end_time);
                        return bStart < slotEnd && bEnd > slotStart && b.status !== 'cancelled';
                    });

                    const isSlotStart = overlapping.some((b) => timeToMinutes(b.start_time) === slotStart);

                    return (
                        <div key={slot} className="flex items-stretch gap-3 py-2">
                            <div className="w-14 shrink-0 pt-2 text-right text-xs font-medium text-gray-400">{slot}</div>
                            <div className="flex-1">
                                {overlapping.length === 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextHour = String(slotStart / 60 + 1).padStart(2, '0');
                                            onSelectEmptySlot(dateStr, slot, `${nextHour}:00`);
                                        }}
                                        className="group flex w-full items-center justify-between rounded-xl border border-dashed border-gray-200 px-3 py-2.5 text-left text-sm text-gray-400 transition hover:border-gray-300 hover:bg-gray-50"
                                    >
                                        <span>Kosong</span>
                                        <Plus className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                                    </button>
                                ) : isSlotStart ? (
                                    overlapping
                                        .filter((b) => timeToMinutes(b.start_time) === slotStart)
                                        .map((booking) => {
                                            const colors = bookingCardColor(booking);
                                            return (
                                                <button
                                                    key={booking.uuid}
                                                    type="button"
                                                    onClick={() => onSelectBooking(booking)}
                                                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition hover:shadow-sm ${colors.bg} ${colors.border}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm font-semibold ${colors.text}`}>{booking.customer_name}</p>
                                                        <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)} · {formatCurrency(booking.price)}
                                                    </p>
                                                </button>
                                            );
                                        })
                                ) : (
                                    overlapping.map((booking) => {
                                        const colors = bookingCardColor(booking);
                                        return (
                                            <button
                                                key={booking.uuid}
                                                type="button"
                                                onClick={() => onSelectBooking(booking)}
                                                className={`flex h-full w-full items-center rounded-xl border px-3 py-2 text-left opacity-70 transition hover:opacity-100 hover:shadow-sm ${colors.bg} ${colors.border}`}
                                            >
                                                <span className={`mr-2 h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                                                <p className={`text-xs font-medium ${colors.text}`}>{booking.customer_name} · berlangsung</p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
