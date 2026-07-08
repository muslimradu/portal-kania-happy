import type { GymClass } from './gym-class';

export interface MembershipPackageDetail {
    id: number;
    uuid: string;
    membership_package_id: number;
    gym_class_id: number;
    quota_group: number | null;
    quota: number | null;
    is_unlimited: boolean;
    gym_class?: GymClass;
}

export interface MembershipPackage {
    id: number;
    uuid: string;
    name: string;
    price: number;
    description: string | null;
    expired_duration: number | null;
    expired_type: 'days' | 'weeks' | 'months' | 'years' | 'manual';
    is_active: boolean;
    details: MembershipPackageDetail[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface MembershipPackagePagination {
    data: MembershipPackage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface MembershipPackageFilters {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
    per_page?: number;
}
