import type { Membership } from './membership';
import type { PaymentConfiguration } from './payment-configuration';

export interface Invoice {
    id: number;
    uuid: string;
    invoice_number: string;
    member_id: number;
    payment_configuration_id: number | null;
    payment_method: 'cash' | 'transfer' | 'qris';
    total_amount: number;
    status: 'pending' | 'paid' | 'cancelled';
    notes: string | null;
    memberships?: Membership[];
    payment_configuration?: PaymentConfiguration | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
