import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trainingFormSchema, type TrainingFormValues } from '@/lib/validations/training';
import type { Training } from '@/types/training';
import TrainingDatesPicker from './TrainingDatesPicker';

interface TrainingFormProps {
    training?: Training;
    onSubmit: (data: TrainingFormValues) => void;
    processing: boolean;
}

export default function TrainingForm({ training, onSubmit, processing }: TrainingFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TrainingFormValues>({
        resolver: zodResolver(trainingFormSchema),
        defaultValues: {
            title: training?.title ?? '',
            description: training?.description ?? '',
            trainer_name: training?.trainer_name ?? '',
            training_dates: training?.training_dates?.length
                ? [...training.training_dates].sort()
                : [],
            training_location: training?.training_location ?? '',
            price: training?.price ?? 0,
        },
    });

    const trainingDates = watch('training_dates');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="title">Judul Pelatihan</Label>
                <Input
                    id="title"
                    placeholder="contoh: Basic Mat Pilates"
                    className="rounded-xl"
                    {...register('title')}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                    id="description"
                    rows={3}
                    placeholder="Deskripsi singkat pelatihan (opsional)"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    {...register('description')}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="trainer_name">Trainer</Label>
                    <Input
                        id="trainer_name"
                        placeholder="Nama trainer"
                        className="rounded-xl"
                        {...register('trainer_name')}
                    />
                    {errors.trainer_name && <p className="text-sm text-red-600">{errors.trainer_name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="training_location">Lokasi</Label>
                    <Input
                        id="training_location"
                        placeholder="Lokasi pelatihan (opsional)"
                        className="rounded-xl"
                        {...register('training_location')}
                    />
                </div>
            </div>

            <TrainingDatesPicker
                value={trainingDates}
                onChange={(dates) => setValue('training_dates', dates, { shouldValidate: true })}
                error={
                    typeof errors.training_dates?.message === 'string'
                        ? errors.training_dates.message
                        : undefined
                }
            />

            <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                    id="price"
                    type="number"
                    min="0"
                    className="rounded-xl"
                    {...register('price', { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
            </div>

            <Button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl"
                style={{ backgroundColor: 'var(--brand-primary)' }}
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Simpan Pelatihan
                    </>
                )}
            </Button>
        </form>
    );
}
