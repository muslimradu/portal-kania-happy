import type { PaymentConfiguration } from './payment-configuration';

export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cash' | 'transfer' | 'qris';

export interface StudioBooking {
    id: number;
    uuid: string;
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    price: number;
    notes: string | null;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    payment_configuration_id: number | null;
    payment_configuration?: PaymentConfiguration | null;
    invoice_number: string | null;
    paid_at: string | null;
    status: BookingStatus;
    cancelled_at: string | null;
    cancel_reason: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface StudioBookingPagination {
    data: StudioBooking[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface StudioBookingFilters {
    search?: string;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_dir?: string;
    per_page?: number;
}

export interface BookingSettings {
    price_per_hour: number;
    operating_hours: {
        start: string;
        end: string;
    };
}

export interface AvailabilitySegment {
    start: string;
    end: string;
    status: 'available' | 'booked' | 'unpaid';
}
