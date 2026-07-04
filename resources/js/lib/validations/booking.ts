import { z } from 'zod';

export const bookingStep1Schema = z.object({
    customer_name: z.string().min(1, 'Nama pelanggan wajib diisi').max(150),
    customer_phone: z
        .string()
        .min(1, 'Nomor telepon wajib diisi')
        .max(20)
        .regex(/^0?8[0-9]{7,15}$|^628[0-9]{6,15}$/, 'Format nomor telepon tidak valid'),
    notes: z.string().max(500).nullable().optional(),
});

export const bookingStep2Schema = z
    .object({
        booking_date: z.string().min(1, 'Tanggal booking wajib diisi'),
        start_time: z.string().min(1, 'Jam mulai wajib diisi'),
        end_time: z.string().min(1, 'Jam selesai wajib diisi'),
    })
    .refine((data) => data.end_time > data.start_time, {
        message: 'Jam selesai harus setelah jam mulai',
        path: ['end_time'],
    });

export type BookingStep1Values = z.infer<typeof bookingStep1Schema>;
export type BookingStep2Values = z.infer<typeof bookingStep2Schema>;
