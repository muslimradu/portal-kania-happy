import { z } from 'zod';

export const registrationStep1Schema = z.object({
    name: z.string().min(1, 'Nama wajib diisi').max(100),
    phone: z
        .string()
        .min(1, 'Nomor telepon wajib diisi')
        .max(20)
        .regex(/^0?8[0-9]{7,15}$|^628[0-9]{6,15}$/, 'Format nomor telepon tidak valid'),
    address: z.string().max(500).nullable().optional(),
    birth_date: z.string().nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
});

export const registrationStep3Schema = z
    .object({
        payment_method: z.enum(['cash', 'transfer', 'qris']),
        payment_configuration_id: z.number().nullable(),
    })
    .refine(
        (data) => data.payment_method === 'cash' || data.payment_configuration_id !== null,
        { message: 'Pilih rekening/QRIS tujuan pembayaran', path: ['payment_configuration_id'] },
    );

export type RegistrationStep1Values = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep3Values = z.infer<typeof registrationStep3Schema>;
