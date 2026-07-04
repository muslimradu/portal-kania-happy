import type { Invoice } from './invoice';
import type { Membership } from './membership';
import type { AttendanceItem, MemberTimelineItem } from './cashier';

export interface Member {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    gender: 'male' | 'female' | null;
    birth_date: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    active_memberships_count?: number;
    memberships?: Membership[];
    invoices?: Invoice[];
    timelines?: MemberTimelineItem[];
    attendances?: AttendanceItem[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface MemberPagination {
    data: Member[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface MemberFilters {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
    per_page?: number;
}
