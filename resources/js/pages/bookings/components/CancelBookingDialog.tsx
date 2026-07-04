import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2, TriangleAlert } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { StudioBooking } from '@/types/booking';

interface CancelBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking?: StudioBooking;
}

export default function CancelBookingDialog({ open, onOpenChange, booking }: CancelBookingDialogProps) {
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!booking) return null;

    const handleConfirm = () => {
        setProcessing(true);
        router.post(
            route('bookings.cancel', booking.uuid),
            { reason: reason || null },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setReason('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-md">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                            <TriangleAlert className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <DialogTitle>Batalkan Booking?</DialogTitle>
                            <DialogDescription className="mt-1">
                                Booking &quot;{booking.customer_name}&quot; akan ditandai sebagai dibatalkan.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <textarea
                    rows={2}
                    placeholder="Alasan pembatalan (opsional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing} className="rounded-xl">
                        Batal
                    </Button>
                    <Button onClick={handleConfirm} disabled={processing} className="rounded-xl bg-orange-500 text-white hover:bg-orange-600">
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ya, Batalkan Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
