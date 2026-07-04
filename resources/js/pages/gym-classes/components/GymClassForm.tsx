import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { gymClassSchema, type GymClassFormValues } from '@/lib/validations/gym-class';
import type { GymClass } from '@/types/gym-class';
import GymClassPreviewCard from './GymClassPreviewCard';

interface GymClassFormProps {
    gymClass?: GymClass;
    onSubmit: (data: GymClassFormValues) => void;
    processing: boolean;
}

const SUGGESTED_COLORS = [
    '#7C3AED', '#C8A2C8', '#D2AFFF', '#D97706',
    '#AA98A9', '#DB2777', '#0891B2', '#4F46E5',
    '#EA580C', '#65A30D', '#0284C7', '#0F172A',
];

const SUGGESTED_ICONS = [
    'Dumbbell', 'Heart', 'Zap', 'Star',
    'Flame', 'Activity', 'Music', 'Wind',
    'Bike', 'PersonStanding', 'Footprints', 'Trophy',
];

export default function GymClassForm({ gymClass, onSubmit, processing }: GymClassFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<GymClassFormValues>({
        resolver: zodResolver(gymClassSchema),
        defaultValues: {
            name:        gymClass?.name        ?? '',
            price:       gymClass?.price       ?? 0,
            color_label: gymClass?.color_label ?? '#7C3AED',
            icon:        gymClass?.icon        ?? 'Dumbbell',
            is_active:   gymClass?.is_active   ?? true,
        },
    });

    const values = watch();

    const handleColorPickerClick = () => {
        const input = document.getElementById('color-picker-input') as HTMLInputElement;
        input?.click();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
            {/* Form Fields */}
            <div className="space-y-5 lg:col-span-2">
                {/* Nama */}
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Kelas</Label>
                    <Input
                        id="name"
                        placeholder="contoh: Pilates, Yoga, Aerobic"
                        className="rounded-xl"
                        {...register('name')}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
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
                    {errors.price && (
                        <p className="text-sm text-red-600">{errors.price.message}</p>
                    )}
                </div>

                {/* Warna */}
                <div className="space-y-2">
                    <Label>Warna Label</Label>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setValue('color_label', color)}
                                className="h-8 w-8 rounded-lg border-2 transition hover:scale-110"
                                style={{
                                    backgroundColor: color,
                                    borderColor: values.color_label === color ? '#000' : 'transparent',
                                }}
                            />
                        ))}
                        {/* Custom Color Picker Button */}
                        <div className="relative">
                            <input
                                id="color-picker-input"
                                type="color"
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                value={values.color_label}
                                onChange={(e) => setValue('color_label', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleColorPickerClick}
                                className="flex h-8 items-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 px-2 text-xs text-gray-500 transition hover:border-gray-400 hover:text-gray-700"
                            >
                                <div
                                    className="h-4 w-4 rounded"
                                    style={{ backgroundColor: values.color_label }}
                                />
                                Pilih Warna
                            </button>
                        </div>
                    </div>
                    {errors.color_label && (
                        <p className="text-sm text-red-600">{errors.color_label.message}</p>
                    )}
                </div>

                {/* Icon */}
                <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-14">
                        {SUGGESTED_ICONS.map((iconName) => {
                            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[iconName];
                            if (!Icon) return null;
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setValue('icon', iconName)}
                                    title={iconName}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition hover:scale-105 ${
                                        values.icon === iconName
                                            ? 'border-current'
                                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                    }`}
                                    style={values.icon === iconName ? {
                                        backgroundColor: values.color_label + '20',
                                        borderColor: values.color_label,
                                    } : {}}
                                >
                                    <Icon
                                        className="h-4 w-4"
                                        style={{ color: values.icon === iconName ? values.color_label : '#6b7280' }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    {errors.icon && (
                        <p className="text-sm text-red-600">{errors.icon.message}</p>
                    )}
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                            <p className="text-xs text-gray-500">Kelas yang tidak aktif tidak akan muncul di kasir</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue('is_active', !values.is_active)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                values.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                    values.is_active ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
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
                        <><Save className="mr-2 h-4 w-4" /> Simpan Kelas</>
                    )}
                </Button>
            </div>

            {/* Preview Card */}
            <div className="lg:col-span-1">
                <Label className="mb-2 block">Preview</Label>
                <GymClassPreviewCard
                    name={values.name || 'Nama Kelas'}
                    price={values.price || 0}
                    color={values.color_label || '#7C3AED'}
                    icon={values.icon || 'Dumbbell'}
                    isActive={values.is_active}
                />
            </div>
        </form>
    );
}