import { z } from 'zod';

export const trainingParticipantFormSchema = z.object({
    full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
    phone: z
        .string()
        .min(1, 'Nomor HP wajib diisi')
        .regex(/^0?8[0-9]{7,15}$|^628[0-9]{6,15}$/, 'Format nomor telepon tidak valid'),
    training_uuid: z.string().min(1, 'Pelatihan wajib dipilih'),
    selected_training_dates: z.array(z.string()).optional(),
    payment_method: z.enum(['cash', 'transfer', 'qris', 'pay_later']),
    payment_configuration_id: z.number().nullable().optional(),
});

export type TrainingParticipantFormValues = z.infer<typeof trainingParticipantFormSchema>;
