import { z } from 'zod';

export const membershipPackageDetailSchema = z.object({
    gym_class_id: z.number().min(1, 'Pilih kelas gym'),
    quota: z.number().min(1, 'Kuota minimal 1').nullable(),
    is_unlimited: z.boolean(),
});

export const membershipPackageSchema = z.object({
    name: z.string().min(1, 'Nama paket wajib diisi').max(100),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
    description: z.string().max(500).nullable(),
    expired_type: z.enum(['days', 'weeks', 'months', 'years', 'manual']),
    expired_duration: z.number().min(1).nullable(),
    is_active: z.boolean(),
    details: z.array(membershipPackageDetailSchema).min(1, 'Minimal satu kelas gym wajib ditambahkan'),
});

export type MembershipPackageFormValues = z.infer<typeof membershipPackageSchema>;
export type MembershipPackageDetailFormValues = z.infer<typeof membershipPackageDetailSchema>;
