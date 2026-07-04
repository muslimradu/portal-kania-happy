import { useState } from 'react';
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
import type { BookingSettings } from '@/types/booking';

interface BookingSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingSettings: BookingSettings;
}

export default function BookingSettingsDialog({ open, onOpenChange, bookingSettings }: BookingSettingsDialogProps) {
    const [form, setForm] = useState({
        booking_price_per_hour: String(bookingSettings.price_per_hour),
        booking_operating_start: bookingSettings.operating_hours.start,
        booking_operating_end: bookingSettings.operating_hours.end,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.patch(route('bookings.settings.update'), form, {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setErrors(err as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ backgroundColor: 'white', width: '90vw', maxWidth: '440px' }}>
                <DialogHeader>
                    <DialogTitle>Pengaturan Booking Sanggar</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="settings-price">Harga per Jam (Rp)</Label>
                        <Input
                            id="settings-price"
                            type="number"
                            min={0}
                            className="rounded-xl"
                            value={form.booking_price_per_hour}
                            onChange={(e) => setForm({ ...form, booking_price_per_hour: e.target.value })}
                        />
                        {errors.booking_price_per_hour && <p className="text-sm text-red-600">{errors.booking_price_per_hour}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="settings-start">Jam Buka</Label>
                            <Input
                                id="settings-start"
                                type="time"
                                className="rounded-xl"
                                value={form.booking_operating_start}
                                onChange={(e) => setForm({ ...form, booking_operating_start: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="settings-end">Jam Tutup</Label>
                            <Input
                                id="settings-end"
                                type="time"
                                className="rounded-xl"
                                value={form.booking_operating_end}
                                onChange={(e) => setForm({ ...form, booking_operating_end: e.target.value })}
                            />
                        </div>
                    </div>
                    {errors.booking_operating_end && <p className="text-sm text-red-600">{errors.booking_operating_end}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
