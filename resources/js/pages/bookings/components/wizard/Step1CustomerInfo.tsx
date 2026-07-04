import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bookingStep1Schema, type BookingStep1Values } from '@/lib/validations/booking';

interface Step1CustomerInfoProps {
    defaultValues: BookingStep1Values;
    onNext: (data: BookingStep1Values) => void;
}

export default function Step1CustomerInfo({ defaultValues, onNext }: Step1CustomerInfoProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookingStep1Values>({
        resolver: zodResolver(bookingStep1Schema),
        defaultValues,
    });

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="booking-customer-name">Nama Pelanggan</Label>
                <Input id="booking-customer-name" className="rounded-xl" placeholder="contoh: Ibu Sinta" {...register('customer_name')} />
                {errors.customer_name && <p className="text-sm text-red-600">{errors.customer_name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="booking-customer-phone">Nomor Telepon</Label>
                <Input id="booking-customer-phone" className="rounded-xl" placeholder="08123456789" {...register('customer_phone')} />
                <p className="text-xs text-gray-400">Otomatis dikonversi ke format 628xxxxxxxxx</p>
                {errors.customer_phone && <p className="text-sm text-red-600">{errors.customer_phone.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="booking-notes">Catatan (Opsional)</Label>
                <textarea
                    id="booking-notes"
                    rows={2}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Catatan tambahan untuk booking ini"
                    {...register('notes')}
                />
            </div>

            <Button type="submit" className="w-full rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                Lanjut ke Jadwal <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </form>
    );
}
