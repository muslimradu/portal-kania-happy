import { z } from 'zod';

export const membershipPackageDetailSchema = z.object({
    gym_class_id: z.number().min(1, 'Pilih kelas gym'),
    quota: z.number().min(1, 'Kuota minimal 1').nullable(),
    is_unlimited: z.boolean(),
});

export const membershipPackageSchema = z.object({
    name: z.string().min(1, 'Nama paket wajib diisi').max(100),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
    expired_type: z.enum(['days', 'weeks', 'months', 'years', 'manual']),
    expired_duration: z.number().min(1).nullable(),
    is_active: z.boolean(),
    details: z.array(membershipPackageDetailSchema)
        .min(1, 'Minimal satu kelas gym wajib ditambahkan')
        .refine(
            (details) => {
                const ids = details.map((d) => d.gym_class_id);
                return new Set(ids).size === ids.length;
            },
            { message: 'Tidak boleh ada kelas gym yang sama' }
        ),
});

export type MembershipPackageFormValues = z.infer<typeof membershipPackageSchema>;
export type MembershipPackageDetailFormValues = z.infer<typeof membershipPackageDetailSchema>;
