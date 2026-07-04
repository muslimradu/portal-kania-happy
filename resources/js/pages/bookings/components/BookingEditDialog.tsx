import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateDurationMinutes, calculatePrice, formatCurrency, formatDuration } from '../bookingHelpers';
import type { BookingSettings, StudioBooking } from '@/types/booking';

interface BookingEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking?: StudioBooking;
    bookingSettings: BookingSettings;
}

export default function BookingEditDialog({ open, onOpenChange, booking, bookingSettings }: BookingEditDialogProps) {
    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        booking_date: '',
        start_time: '',
        end_time: '',
        notes: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (booking) {
            setForm({
                customer_name: booking.customer_name,
                customer_phone: booking.customer_phone,
                booking_date: booking.booking_date,
                start_time: booking.start_time.slice(0, 5),
                end_time: booking.end_time.slice(0, 5),
                notes: booking.notes ?? '',
            });
        }
        setErrors({});
    }, [booking, open]);

    const duration = calculateDurationMinutes(form.start_time, form.end_time);
    const price = calculatePrice(duration, bookingSettings.price_per_hour);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;

        setProcessing(true);
        router.patch(route('bookings.update', booking.uuid), form, {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setErrors(err as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ backgroundColor: 'white', width: '90vw', maxWidth: '520px' }} className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-customer-name">Nama Pelanggan</Label>
                        <Input
                            id="edit-customer-name"
                            className="rounded-xl"
                            value={form.customer_name}
                            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        />
                        {errors.customer_name && <p className="text-sm text-red-600">{errors.customer_name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-customer-phone">Nomor Telepon</Label>
                        <Input
                            id="edit-customer-phone"
                            className="rounded-xl"
                            value={form.customer_phone}
                            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                        />
                        {errors.customer_phone && <p className="text-sm text-red-600">{errors.customer_phone}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-booking-date">Tanggal Booking</Label>
                        <Input
                            id="edit-booking-date"
                            type="date"
                            className="rounded-xl"
                            value={form.booking_date}
                            onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                        />
                        {errors.booking_date && <p className="text-sm text-red-600">{errors.booking_date}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="edit-start-time">Jam Mulai</Label>
                            <Input
                                id="edit-start-time"
                                type="time"
                                className="rounded-xl"
                                value={form.start_time}
                                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-end-time">Jam Selesai</Label>
                            <Input
                                id="edit-end-time"
                                type="time"
                                className="rounded-xl"
                                value={form.end_time}
                                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                            />
                        </div>
                    </div>
                    {(errors.start_time || errors.end_time || errors.schedule) && (
                        <p className="text-sm text-red-600">{errors.schedule || errors.start_time || errors.end_time}</p>
                    )}

                    {duration > 0 && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Durasi</span>
                                <span className="font-medium text-gray-900">{formatDuration(duration)}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-gray-600">Harga Baru</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(price)}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Catatan</Label>
                        <textarea
                            id="edit-notes"
                            rows={2}
                            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
