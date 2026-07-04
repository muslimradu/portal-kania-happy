import { z } from 'zod';

export const qrisSchema = z.object({
    name: z.string().min(1, 'Nama QRIS wajib diisi').max(100),
    qris_type: z.enum(['upload', 'url']),
    qris_url: z.string().url('Format URL tidak valid').nullable().optional(),
    is_active: z.boolean(),
}).refine(
    (data) => data.qris_type !== 'url' || (data.qris_url && data.qris_url.length > 0),
    { message: 'URL QRIS wajib diisi', path: ['qris_url'] }
);

export const transferSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi').max(100),
    bank_name: z.string().min(1, 'Nama bank wajib diisi').max(100),
    account_number: z.string().min(1, 'Nomor rekening wajib diisi').max(50),
    account_holder: z.string().min(1, 'Nama pemilik rekening wajib diisi').max(100),
    is_active: z.boolean(),
});

export type QrisFormValues = z.infer<typeof qrisSchema>;
export type TransferFormValues = z.infer<typeof transferSchema>;
