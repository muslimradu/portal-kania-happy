export interface PaymentConfiguration {
    id: number;
    uuid: string;
    type: 'qris' | 'transfer';
    name: string;
    qris_type: 'upload' | 'url' | null;
    qris_image: string | null;
    qris_url: string | null;
    bank_name: string | null;
    account_number: string | null;
    account_holder: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
