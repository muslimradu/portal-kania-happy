import { z } from 'zod';

export const membershipPackageGroupSchema = z.object({
    gym_class_ids: z.array(z.number().min(1)).min(1, 'Minimal satu kelas'),
    quota: z.number().min(1).nullable(),
    is_unlimited: z.boolean(),
}).superRefine((group, ctx) => {
    if (!group.is_unlimited && (group.quota === null || group.quota < 1)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kuota minimal 1', path: ['quota'] });
    }
});

export const membershipPackageSchema = z.object({
    name: z.string().min(1, 'Nama paket wajib diisi').max(100),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
    expired_type: z.enum(['days', 'weeks', 'months', 'years', 'manual']),
    expired_duration: z.number().min(1).nullable(),
    is_active: z.boolean(),
    groups: z.array(membershipPackageGroupSchema)
        .min(1, 'Minimal satu kelas gym wajib ditambahkan')
        .refine(
            (groups) => {
                const ids = groups.flatMap((group) => group.gym_class_ids);
                return new Set(ids).size === ids.length;
            },
            { message: 'Tidak boleh ada kelas gym yang sama' },
        ),
});

export type MembershipPackageFormValues = z.infer<typeof membershipPackageSchema>;
export type MembershipPackageGroupFormValues = z.infer<typeof membershipPackageGroupSchema>;
