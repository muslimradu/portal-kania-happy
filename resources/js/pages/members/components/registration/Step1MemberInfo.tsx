import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registrationStep1Schema, type RegistrationStep1Values } from '@/lib/validations/member-registration';

interface Step1MemberInfoProps {
    defaultValues: RegistrationStep1Values;
    onNext: (data: RegistrationStep1Values) => void;
}

export default function Step1MemberInfo({ defaultValues, onNext }: Step1MemberInfoProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegistrationStep1Values>({
        resolver: zodResolver(registrationStep1Schema),
        defaultValues,
    });

    const values = watch();

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="reg-name">Nama Lengkap</Label>
                <Input id="reg-name" className="rounded-xl" placeholder="contoh: Siti Aminah" {...register('name')} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="reg-phone">Nomor Telepon</Label>
                <Input id="reg-phone" className="rounded-xl" placeholder="08123456789" {...register('phone')} />
                <p className="text-xs text-gray-400">Otomatis dikonversi ke format 628xxxxxxxxx</p>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="reg-address">Alamat (Opsional)</Label>
                <textarea
                    id="reg-address"
                    rows={2}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Alamat lengkap"
                    {...register('address')}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="reg-birth_date">Tanggal Lahir (Opsional)</Label>
                <Input
                    id="reg-birth_date"
                    type="date"
                    className="rounded-xl"
                    value={values.birth_date ?? ''}
                    onChange={(e) => setValue('birth_date', e.target.value === '' ? null : e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="reg-notes">Catatan (Opsional)</Label>
                <textarea
                    id="reg-notes"
                    rows={2}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Catatan tambahan"
                    {...register('notes')}
                />
            </div>

            <Button type="submit" className="w-full rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                Lanjut ke Pilih Paket <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </form>
    );
}
