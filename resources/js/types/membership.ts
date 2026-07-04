import type { GymClass } from './gym-class';

export interface MembershipDetail {
    id: number;
    uuid: string;
    membership_id: number;
    gym_class_id: number | null;
    class_name: string;
    quota: number | null;
    quota_used: number;
    is_unlimited: boolean;
    gym_class?: GymClass;
}

export interface Membership {
    id: number;
    uuid: string;
    member_id: number;
    membership_package_id: number | null;
    invoice_id: number | null;
    package_name: string;
    price: number;
    status: 'active' | 'expired' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    details: MembershipDetail[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
