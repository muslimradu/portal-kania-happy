import type { Training } from './training';

export type TrainingPaymentStatus = 'unpaid' | 'paid' | 'pay_later';
export type TrainingPaymentMethod = 'cash' | 'transfer' | 'qris' | 'pay_later';

export interface TrainingParticipantPayment {
    id: number;
    uuid: string;
    invoice_number: string;
    amount: number;
    payment_method: string;
    paid_at: string;
    recorder?: { id: number; name: string };
}

export interface TrainingParticipant {
    id: number;
    uuid: string;
    full_name: string;
    phone: string;
    payment_status: TrainingPaymentStatus;
    payment_method: TrainingPaymentMethod | null;
    payment_configuration_id: number | null;
    invoice_number: string | null;
    amount: number;
    selected_training_dates?: string[];
    paid_at: string | null;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
    training?: Training;
    payments?: TrainingParticipantPayment[];
}

export interface TrainingParticipantFilters {
    search?: string;
    payment_status?: string;
    training_date?: string;
    training_uuid?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
}

export interface TrainingParticipantPagination {
    data: TrainingParticipant[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
