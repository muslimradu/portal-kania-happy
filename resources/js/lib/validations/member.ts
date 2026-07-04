import { z } from 'zod';

export const memberSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi').max(100),
    phone: z
        .string()
        .min(1, 'Nomor telepon wajib diisi')
        .max(20)
        .regex(/^0?8[0-9]{7,15}$|^628[0-9]{6,15}$/, 'Format nomor telepon tidak valid'),
    gender: z.enum(['male', 'female']).nullable().optional(),
    birth_date: z.string().nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    is_active: z.boolean(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;
