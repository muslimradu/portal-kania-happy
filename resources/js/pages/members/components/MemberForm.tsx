import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { memberSchema, type MemberFormValues } from '@/lib/validations/member';
import type { Member } from '@/types/member';

interface MemberFormProps {
    member?: Member;
    onSubmit: (data: MemberFormValues) => void;
    processing: boolean;
}

export default function MemberForm({ member, onSubmit, processing }: MemberFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: member?.name ?? '',
            phone: member?.phone ?? '',
            gender: member?.gender ?? null,
            birth_date: member?.birth_date ?? null,
            address: member?.address ?? '',
            notes: member?.notes ?? '',
            is_active: member?.is_active ?? true,
        },
    });

    const values = watch();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" className="rounded-xl" placeholder="contoh: Siti Aminah" {...register('name')} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" className="rounded-xl" placeholder="08123456789" {...register('phone')} />
                <p className="text-xs text-gray-400">Otomatis dikonversi ke format 628xxxxxxxxx</p>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="gender">Gender (Opsional)</Label>
                    <select
                        id="gender"
                        className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={values.gender ?? ''}
                        onChange={(e) => setValue('gender', e.target.value === '' ? null : (e.target.value as 'male' | 'female'))}
                    >
                        <option value="">Tidak dipilih</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="birth_date">Tanggal Lahir (Opsional)</Label>
                    <Input
                        id="birth_date"
                        type="date"
                        className="rounded-xl"
                        value={values.birth_date ?? ''}
                        onChange={(e) => setValue('birth_date', e.target.value === '' ? null : e.target.value)}
                    />
                    {errors.birth_date && <p className="text-sm text-red-600">{errors.birth_date.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Alamat (Opsional)</Label>
                <textarea
                    id="address"
                    rows={2}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Alamat lengkap"
                    {...register('address')}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <textarea
                    id="notes"
                    rows={2}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Catatan tambahan"
                    {...register('notes')}
                />
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                        <p className="text-xs text-gray-500">Member nonaktif tidak dapat melakukan transaksi baru</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setValue('is_active', !values.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            values.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${values.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl"
                style={{ backgroundColor: 'var(--brand-primary)' }}
            >
                {processing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> Simpan Member</>
                )}
            </Button>
        </form>
    );
}
