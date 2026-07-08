import type { GymClass } from './gym-class';
import type { Membership } from './membership';
import type { PaymentConfiguration } from './payment-configuration';

export type CashierPaymentMethod = 'cash' | 'transfer' | 'qris' | 'pay_later';
export type CashierPaymentStatus = 'paid' | 'unpaid';

export interface CashierGymClass extends GymClass {
    attendances_count?: number;
}

export interface CashierMember {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    is_active: boolean;
    active_memberships?: Membership[];
}

export interface EligibilityResult {
    eligible: boolean;
    is_unlimited?: boolean;
    remaining_quota?: number | null;
    package_name?: string | null;
    title?: string;
    message?: string;
    reason?: 'no_membership' | 'quota_exhausted';
}

export type CustomerType = 'member' | 'non_member';

export interface NonMemberInfo {
    name: string;
    phone: string;
}

export interface CashierResult {
    type: 'checkin' | 'transaction';
    invoice_number: string | null;
    member_name?: string;
    customer_name?: string;
    class_name: string;
    amount?: number;
    checked_in_at?: string;
    pay_later?: boolean;
}

export interface TodayAttendanceRow {
    uuid: string;
    name: string;
    gym_class: string;
    member_status: 'member' | 'non_member';
    payment_status: CashierPaymentStatus;
    amount: number;
    invoice_number: string | null;
    checked_in_at: string;
}

export interface CashierPageProps {
    gymClasses: CashierGymClass[];
    paymentConfigurations: PaymentConfiguration[];
    todayAttendance: TodayAttendanceRow[];
}

export interface MemberTimelineItem {
    id: number;
    uuid: string;
    member_id: number;
    type: 'purchase' | 'checkin';
    title: string;
    description: string | null;
    created_at: string;
}

export interface AttendanceItem {
    id: number;
    uuid: string;
    member_id: number;
    gym_class_id: number | null;
    class_name: string;
    package_name: string | null;
    quota_before: number | null;
    quota_after: number | null;
    is_unlimited: boolean;
    checked_in_at: string;
    gym_class?: GymClass;
}
