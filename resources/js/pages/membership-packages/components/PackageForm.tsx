import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2, Save, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { membershipPackageSchema, type MembershipPackageFormValues } from '@/lib/validations/membership-package';
import { detailsToGroups, groupsToDetails, type PackageDetailInput } from '@/lib/membership-package-groups';
import type { MembershipPackage } from '@/types/membership-package';
import type { GymClass } from '@/types/gym-class';
import PackagePreviewCard from './PackagePreviewCard';

interface PackageFormProps {
    pkg?: MembershipPackage;
    gymClasses: GymClass[];
    onSubmit: (data: Omit<MembershipPackageFormValues, 'groups'> & { details: PackageDetailInput[] }) => void;
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
            groups: pkg?.details?.length
                ? detailsToGroups(pkg.details.map((detail) => ({
                    gym_class_id: detail.gym_class_id,
                    quota: detail.quota,
                    is_unlimited: detail.is_unlimited,
                    quota_group: detail.quota_group,
                })))
                : [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'groups' });
    const values = watch();
    const usedGymClassIds = values.groups.flatMap((group) => group.gym_class_ids);
    const availableGymClasses = gymClasses.filter((gymClass) => !usedGymClassIds.includes(gymClass.id));

    const addSingleClass = () => {
        if (availableGymClasses.length === 0) return;
        append({
            gym_class_ids: [availableGymClasses[0].id],
            quota: 1,
            is_unlimited: false,
        });
    };

    const addSharedGroup = () => {
        if (availableGymClasses.length < 2) return;
        append({
            gym_class_ids: [availableGymClasses[0].id, availableGymClasses[1].id],
            quota: 4,
            is_unlimited: false,
        });
    };

    const addClassToGroup = (groupIndex: number) => {
        if (availableGymClasses.length === 0) return;
        const current = values.groups[groupIndex]?.gym_class_ids ?? [];
        setValue(`groups.${groupIndex}.gym_class_ids`, [...current, availableGymClasses[0].id]);
    };

    const removeClassFromGroup = (groupIndex: number, classIndex: number) => {
        const current = values.groups[groupIndex]?.gym_class_ids ?? [];
        const next = current.filter((_, index) => index !== classIndex);
        if (next.length === 0) {
            remove(groupIndex);
            return;
        }
        setValue(`groups.${groupIndex}.gym_class_ids`, next);
    };

    const submitForm = (formValues: MembershipPackageFormValues) => {
        const { groups, ...rest } = formValues;
        onSubmit({ ...rest, details: groupsToDetails(groups) });
    };

    return (
        <form onSubmit={handleSubmit(submitForm)} className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Paket</Label>
                    <Input id="name" placeholder="contoh: Aero & Zumba 4x" className="rounded-xl" {...register('name')} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input id="price" type="number" min="0" placeholder="0" className="rounded-xl" {...register('price', { valueAsNumber: true })} />
                    {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="expired_type">Tipe Expired</Label>
                        <select id="expired_type" className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...register('expired_type')}>
                            {EXPIRED_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {values.expired_type !== 'manual' && (
                        <div className="space-y-2">
                            <Label htmlFor="expired_duration">Durasi</Label>
                            <Input id="expired_duration" type="number" min="1" placeholder="contoh: 30" className="rounded-xl" {...register('expired_duration', { valueAsNumber: true })} />
                            {errors.expired_duration && <p className="text-sm text-red-600">{errors.expired_duration.message}</p>}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                            <p className="text-xs text-gray-500">Paket nonaktif tidak bisa dipilih saat pendaftaran member</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue('is_active', !values.is_active)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${values.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${values.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label>Kelas Gym</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={addSingleClass} disabled={availableGymClasses.length === 0} className="rounded-xl">
                                <Plus className="mr-1 h-4 w-4" /> Tambah Kelas
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={addSharedGroup} disabled={availableGymClasses.length < 2} className="rounded-xl">
                                <Link2 className="mr-1 h-4 w-4" /> Grup Kuota Bersama
                            </Button>
                        </div>
                    </div>

                    {errors.groups && <p className="text-sm text-red-600">{errors.groups.message}</p>}

                    {fields.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                            <p className="text-sm text-gray-400">Belum ada kelas ditambahkan</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {fields.map((field, groupIndex) => {
                                const group = values.groups[groupIndex];
                                const isShared = (group?.gym_class_ids.length ?? 0) > 1;
                                const isUnlimited = group?.is_unlimited ?? false;

                                return (
                                    <div key={field.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        {isShared && (
                                            <p className="mb-2 text-xs font-medium text-gray-500">
                                                Kuota bersama (atau) — total {group?.quota ?? 0}x bebas dipakai antar kelas
                                            </p>
                                        )}

                                        <div className="space-y-2">
                                            {group?.gym_class_ids.map((classId, classIndex) => (
                                                <div key={`${field.id}-${classId}`} className="flex items-center gap-2">
                                                    <select
                                                        className="flex-1 rounded-lg border border-input bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                        value={classId}
                                                        onChange={(e) => {
                                                            const next = [...group.gym_class_ids];
                                                            next[classIndex] = Number(e.target.value);
                                                            setValue(`groups.${groupIndex}.gym_class_ids`, next);
                                                        }}
                                                    >
                                                        {gymClasses
                                                            .filter((gymClass) => gymClass.id === classId || !usedGymClassIds.includes(gymClass.id))
                                                            .map((gymClass) => (
                                                                <option key={gymClass.id} value={gymClass.id}>{gymClass.name}</option>
                                                            ))}
                                                    </select>
                                                    <button type="button" onClick={() => removeClassFromGroup(groupIndex, classIndex)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {isShared && availableGymClasses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => addClassToGroup(groupIndex)}
                                                className="mt-2 text-xs font-medium"
                                                style={{ color: 'var(--brand-primary)' }}
                                            >
                                                + Tambah kelas ke grup ini
                                            </button>
                                        )}

                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setValue(`groups.${groupIndex}.is_unlimited`, !isUnlimited)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isUnlimited ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${isUnlimited ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                                <span className="text-xs text-gray-500">∞</span>
                                            </div>

                                            {!isUnlimited && (
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Kuota"
                                                    className="w-24 rounded-lg text-sm"
                                                    {...register(`groups.${groupIndex}.quota`, { valueAsNumber: true })}
                                                />
                                            )}

                                            {!isShared && (
                                                <button type="button" onClick={() => remove(groupIndex)} className="ml-auto text-red-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {isShared && (
                                            <div className="mt-2 flex justify-end">
                                                <button type="button" onClick={() => remove(groupIndex)} className="text-xs text-red-500 hover:text-red-700">
                                                    Hapus grup
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="w-full rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan Paket</>}
                </Button>
            </div>

            <div className="lg:col-span-1">
                <Label className="mb-2 block">Preview</Label>
                <PackagePreviewCard
                    name={values.name}
                    price={values.price}
                    expiredType={values.expired_type}
                    expiredDuration={values.expired_duration}
                    groups={values.groups}
                    gymClasses={gymClasses}
                />
            </div>
        </form>
    );
}
