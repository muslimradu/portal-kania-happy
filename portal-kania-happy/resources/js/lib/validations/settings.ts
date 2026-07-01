import { z } from 'zod';

export const generalSettingsSchema = z.object({
    app_name: z.string().min(1, 'Nama aplikasi wajib diisi').max(100),
    app_tagline: z.string().min(1, 'Tagline wajib diisi').max(200),
    app_timezone: z.string().min(1, 'Timezone wajib dipilih'),
    app_currency: z.string().min(1, 'Mata uang wajib diisi').max(10),
    app_date_format: z.string().min(1, 'Format tanggal wajib diisi').max(20),
    app_phone_prefix: z.string().min(1, 'Prefix telepon wajib diisi').max(10),
});

export const brandingSettingsSchema = z.object({
    app_primary_color: z
        .string()
        .min(1, 'Warna utama wajib diisi')
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid. Gunakan format hex (#RRGGBB)'),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
export type BrandingSettingsFormValues = z.infer<typeof brandingSettingsSchema>;