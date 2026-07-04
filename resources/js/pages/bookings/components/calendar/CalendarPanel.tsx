import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import AvailabilityIndicator from '../AvailabilityIndicator';
import CalendarToolbar, { type CalendarViewType } from './CalendarToolbar';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import TimelineView from './TimelineView';
import { addDays, startOfMonth, startOfWeek, toDateInputValue } from './calendarUtils';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import type { AvailabilitySegment, BookingSettings, StudioBooking } from '@/types/booking';

interface CalendarPanelProps {
    bookingSettings: BookingSettings;
    onSelectBooking: (booking: StudioBooking) => void;
    onSelectEmptySlot: (date: string, startTime: string, endTime: string) => void;
    refreshKey: number;
}

export default function CalendarPanel({ bookingSettings, onSelectBooking, onSelectEmptySlot, refreshKey }: CalendarPanelProps) {
    const [view, setView] = useState<CalendarViewType>('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<StudioBooking[]>([]);
    const [availability, setAvailability] = useState<AvailabilitySegment[]>([]);
    const [loading, setLoading] = useState(true);

    const range = useCallback((): { from: string; to: string } => {
        if (view === 'day' || view === 'timeline') {
            const d = toDateInputValue(currentDate);
            return { from: d, to: d };
        }
        if (view === 'week') {
            const start = startOfWeek(currentDate);
            return { from: toDateInputValue(start), to: toDateInputValue(addDays(start, 6)) };
        }
        const start = startOfMonth(currentDate);
        const weekStart = startOfWeek(start);
        return { from: toDateInputValue(weekStart), to: toDateInputValue(addDays(weekStart, 41)) };
    }, [view, currentDate]);

    useEffect(() => {
        let cancelled = false;
        const { from, to } = range();
        setLoading(true);

        axios
            .get(route('bookings.calendar'), { params: { date_from: from, date_to: to } })
            .then(({ data }) => {
                if (cancelled) return;
                setBookings(data.data ?? []);
                setAvailability(data.today_availability ?? []);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [range, refreshKey]);

    const navigate = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
            return;
        }

        const factor = direction === 'next' ? 1 : -1;
        if (view === 'day' || view === 'timeline') {
            setCurrentDate((prev) => addDays(prev, factor));
        } else if (view === 'week') {
            setCurrentDate((prev) => addDays(prev, 7 * factor));
        } else {
            setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + factor, 1));
        }
    };

    return (
        <div className="space-y-4">
            <AvailabilityIndicator segments={availability} />

            <CalendarToolbar view={view} onChangeView={setView} currentDate={currentDate} onNavigate={navigate} />

            {loading ? (
                <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                </div>
            ) : (
                <>
                    {view === 'day' && (
                        <DayView
                            date={currentDate}
                            bookings={bookings}
                            bookingSettings={bookingSettings}
                            onSelectBooking={onSelectBooking}
                            onSelectEmptySlot={onSelectEmptySlot}
                        />
                    )}
                    {view === 'timeline' && (
                        <TimelineView
                            date={currentDate}
                            bookings={bookings}
                            bookingSettings={bookingSettings}
                            onSelectBooking={onSelectBooking}
                            onSelectEmptySlot={onSelectEmptySlot}
                        />
                    )}
                    {view === 'week' && (
                        <WeekView
                            weekStart={startOfWeek(currentDate)}
                            bookings={bookings}
                            bookingSettings={bookingSettings}
                            onSelectBooking={onSelectBooking}
                            onSelectEmptySlot={onSelectEmptySlot}
                        />
                    )}
                    {view === 'month' && (
                        <MonthView
                            monthDate={currentDate}
                            bookings={bookings}
                            onSelectDay={(day) => {
                                setCurrentDate(day);
                                setView('day');
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
