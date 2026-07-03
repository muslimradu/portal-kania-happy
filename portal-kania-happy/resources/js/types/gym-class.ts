export interface GymClass {
    id: number;
    uuid: string;
    name: string;
    price: number;
    color_label: string;
    icon: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface GymClassPagination {
    data: GymClass[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface GymClassFilters {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
    per_page?: number;
}