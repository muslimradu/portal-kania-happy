import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { membershipPackageSchema, type MembershipPackageFormValues } from '@/lib/validations/membership-package';
import type { MembershipPackage } from '@/types/membership-package';
import type { GymClass } from '@/types/gym-class';
import PackagePreviewCard from './PackagePreviewCard';

interface PackageFormProps {
    pkg?: MembershipPackage;
    gymClasses: GymClass[];
    onSubmit: (data: MembershipPackageFormValues) => void;
    processing: boolean;
}

const EXPIRED_TYPE_OPTIONS = [
    { value: 'manual', label: 'Manual' },
    { value: 'days', label: 'Hari' },
    { value: 'weeks', label: 'Minggu' },
    { value: 'months', label: 'Bulan' },
    { value: 'years', label: 'Tahun' },
];

export default function PackageForm({ pkg, gymClasses, onSubmit, processing }: PackageFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<MembershipPackageFormValues>({
        resolver: zodResolver(membershipPackageSchema),
        defaultValues: {
            name:             pkg?.name             ?? '',
            price:            pkg?.price            ?? 0,
            expired_type:     pkg?.expired_type     ?? 'manual',
            expired_duration: pkg?.expired_duration ?? null,
            is_active:        pkg?.is_active        ?? true,
            details: pkg?.details?.map((d) => ({
                gym_class_id: d.gym_class_id,
                quota:        d.quota,
                is_unlimited: d.is_unlimited,
            })) ?? [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'details' });
    const values = watch();

    const usedGymClassIds = values.details.map((d) => d.gym_class_id);
    const availableGymClasses = gymClasses.filter(
        (g) => !usedGymClassIds.includes(g.id),
    );

    const addDetail = () => {
        if (availableGymClasses.length === 0) return;
        append({
            gym_class_id: availableGymClasses[0].id,
            quota:        1,
            is_unlimited: false,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
            {/* Form Fields */}
            <div className="space-y-5 lg:col-span-2">

                {/* Nama */}
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Paket</Label>
                    <Input
                        id="name"
                        placeholder="contoh: Paket Gold, Paket Silver"
                        className="rounded-xl"
                        {...register('name')}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* Harga */}
                <div className="space-y-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="rounded-xl"
                        {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                </div>

                {/* Expired */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="expired_type">Tipe Expired</Label>
                        <select
                            id="expired_type"
                            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            {...register('expired_type')}
                        >
                            {EXPIRED_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {errors.expired_type && <p className="text-sm text-red-600">{errors.expired_type.message}</p>}
                    </div>

                    {values.expired_type !== 'manual' && (
                        <div className="space-y-2">
                            <Label htmlFor="expired_duration">Durasi</Label>
                            <Input
                                id="expired_duration"
                                type="number"
                                min="1"
                                placeholder="contoh: 30"
                                className="rounded-xl"
                                {...register('expired_duration', { valueAsNumber: true })}
                            />
                            {errors.expired_duration && <p className="text-sm text-red-600">{errors.expired_duration.message}</p>}
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                            <p className="text-xs text-gray-500">Paket nonaktif tidak bisa dipilih saat pendaftaran member</p>
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

                {/* Detail Kelas */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Kelas Gym</Label>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addDetail}
                            disabled={availableGymClasses.length === 0}
                            className="rounded-xl"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Tambah Kelas
                        </Button>
                    </div>

                    {errors.details && (
                        <p className="text-sm text-red-600">{errors.details.message}</p>
                    )}

                    {fields.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                            <p className="text-sm text-gray-400">Belum ada kelas ditambahkan</p>
                            <button
                                type="button"
                                onClick={addDetail}
                                className="mt-2 text-sm font-medium"
                                style={{ color: 'var(--brand-primary)' }}
                            >
                                + Tambah kelas pertama
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {fields.map((field, index) => {
                                const isUnlimited = values.details[index]?.is_unlimited;
                                return (
                                    <div key={field.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        {/* Gym Class Select */}
                                        <select
                                            className="flex-1 rounded-lg border border-input bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            {...register(`details.${index}.gym_class_id`, { valueAsNumber: true })}
                                        >
                                            {/* Current selected */}
                                            {gymClasses
                                                .filter((g) =>
                                                    g.id === values.details[index]?.gym_class_id ||
                                                    !usedGymClassIds.includes(g.id)
                                                )
                                                .map((g) => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                        </select>

                                        {/* Unlimited Toggle */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setValue(`details.${index}.is_unlimited`, !isUnlimited)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                    isUnlimited ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${isUnlimited ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                            <span className="text-xs text-gray-500">∞</span>
                                        </div>

                                        {/* Quota Input */}
                                        {!isUnlimited && (
                                            <Input
                                            type="number"
                                            min="1"
                                            placeholder="Kuota"
                                            className="w-24 rounded-lg text-sm"
                                            {...register(`details.${index}.quota`, { valueAsNumber: true })}
                                        />
                                        )}

                                        {/* Remove */}
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                        <><Save className="mr-2 h-4 w-4" /> Simpan Paket</>
                    )}
                </Button>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
                <Label className="mb-2 block">Preview</Label>
                <PackagePreviewCard
                    name={values.name}
                    price={values.price}
                    expiredType={values.expired_type}
                    expiredDuration={values.expired_duration}
                    details={values.details}
                    gymClasses={gymClasses}
                />
            </div>
        </form>
    );
}
