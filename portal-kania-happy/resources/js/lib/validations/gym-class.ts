import { z } from 'zod';

export const gymClassSchema = z.object({
    name: z.string().min(1, 'Nama kelas wajib diisi').max(100),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
    color_label: z
        .string()
        .min(1, 'Warna wajib dipilih')
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid'),
    icon: z.string().min(1, 'Icon wajib diisi').max(100),
    is_active: z.boolean(),
});

export type GymClassFormValues = z.infer<typeof gymClassSchema>;