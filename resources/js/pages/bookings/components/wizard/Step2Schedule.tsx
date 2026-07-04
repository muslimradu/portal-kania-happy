import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ArrowLeft, ArrowRight, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bookingStep2Schema, type BookingStep2Values } from '@/lib/validations/booking';
import { calculateDurationMinutes, calculatePrice, formatCurrency, formatDuration, todayDateInputValue } from '../../bookingHelpers';
import type { BookingSettings, StudioBooking } from '@/types/booking';

interface Step2ScheduleProps {
    defaultValues: BookingStep2Values;
    bookingSettings: BookingSettings;
    excludeBookingId?: number;
    onBack: () => void;
    onNext: (data: BookingStep2Values, price: number, durationMinutes: number) => void;
}

export default function Step2Schedule({ defaultValues, bookingSettings, excludeBookingId, onBack, onNext }: Step2ScheduleProps) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<BookingStep2Values>({
        resolver: zodResolver(bookingStep2Schema),
        defaultValues,
    });

    const values = watch();
    const duration = calculateDurationMinutes(values.start_time, values.end_time);
    const price = calculatePrice(duration, bookingSettings.price_per_hour);

    const [conflict, setConflict] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (!values.booking_date || !values.start_time || !values.end_time || duration <= 0) {
            setConflict(false);
            return;
        }

        let cancelled = false;
        setChecking(true);

        axios
            .get(route('bookings.calendar'), {
                params: { date_from: values.booking_date, date_to: values.booking_date },
            })
            .then(({ data }) => {
                if (cancelled) return;
                const bookings = (data.data as StudioBooking[]).filter(
                    (b) => b.status !== 'cancelled' && b.id !== excludeBookingId,
                );
                const overlap = bookings.some((b) => values.start_time < b.end_time.slice(0, 5) && values.end_time > b.start_time.slice(0, 5));
                setConflict(overlap);
            })
            .finally(() => {
                if (!cancelled) setChecking(false);
            });

        return () => {
            cancelled = true;
        };
    }, [values.booking_date, values.start_time, values.end_time, duration, excludeBookingId]);

    const submit = (data: BookingStep2Values) => {
        if (conflict) return;
        onNext(data, price, duration);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="booking-date">Tanggal Booking</Label>
                <Input id="booking-date" type="date" className="rounded-xl" min={todayDateInputValue()} {...register('booking_date')} />
                {errors.booking_date && <p className="text-sm text-red-600">{errors.booking_date.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="booking-start-time">Jam Mulai</Label>
                    <Input
                        id="booking-start-time"
                        type="time"
                        className="rounded-xl"
                        min={bookingSettings.operating_hours.start}
                        max={bookingSettings.operating_hours.end}
                        {...register('start_time')}
                    />
                    {errors.start_time && <p className="text-sm text-red-600">{errors.start_time.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="booking-end-time">Jam Selesai</Label>
                    <Input
                        id="booking-end-time"
                        type="time"
                        className="rounded-xl"
                        min={bookingSettings.operating_hours.start}
                        max={bookingSettings.operating_hours.end}
                        {...register('end_time')}
                    />
                    {errors.end_time && <p className="text-sm text-red-600">{errors.end_time.message}</p>}
                </div>
            </div>

            <p className="text-xs text-gray-400">
                Jam operasional studio: {bookingSettings.operating_hours.start} - {bookingSettings.operating_hours.end}
            </p>

            {duration > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Durasi</span>
                        <span className="font-medium text-gray-900">{formatDuration(duration)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                        <span className="font-semibold text-gray-900">Total Harga</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                            {formatCurrency(price)}
                        </span>
                    </div>
                </div>
            )}

            {conflict && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Jadwal ini sudah dibooking. Silakan pilih jam lain.</span>
                </div>
            )}

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="submit"
                    disabled={conflict || checking || duration <= 0}
                    className="flex-1 rounded-xl"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    Lanjut ke Pembayaran <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
