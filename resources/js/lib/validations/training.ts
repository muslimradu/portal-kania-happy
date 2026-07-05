import { z } from 'zod';

export const trainingFormSchema = z.object({
    title: z.string().min(1, 'Judul pelatihan wajib diisi'),
    description: z.string().optional().nullable(),
    trainer_name: z.string().min(1, 'Trainer wajib diisi'),
    training_dates: z
        .array(z.string().min(1))
        .min(1, 'Minimal satu tanggal pelatihan wajib diisi')
        .refine((dates) => new Set(dates).size === dates.length, 'Tanggal pelatihan tidak boleh duplikat'),
    training_location: z.string().optional().nullable(),
    price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
});

export type TrainingFormValues = z.infer<typeof trainingFormSchema>;
