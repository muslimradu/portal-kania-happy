import { z } from 'zod';

export const nonMemberCustomerSchema = z.object({
    customer_name: z.string().min(1, 'Nama pelanggan wajib diisi').max(100),
    customer_phone: z
        .string()
        .max(20)
        .regex(/^0?8[0-9]{7,15}$|^628[0-9]{6,15}$/, 'Format nomor telepon tidak valid')
        .optional()
        .or(z.literal('')),
});

export type NonMemberCustomerValues = z.infer<typeof nonMemberCustomerSchema>;
