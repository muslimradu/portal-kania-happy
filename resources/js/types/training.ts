export type TrainingStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Training {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    trainer_name: string;
    training_dates: string[];
    first_training_date?: string | null;
    last_training_date?: string | null;
    training_location: string | null;
    price: number;
    status: TrainingStatus;
    participants_count?: number;
    paid_participants_count?: number;
    unpaid_participants_count?: number;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface TrainingFilters {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
}

export interface TrainingPagination {
    data: Training[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface TrainingOption {
    id: number;
    uuid: string;
    title: string;
    price: number;
    trainer_name: string;
    training_dates: string[];
    first_training_date?: string | null;
    last_training_date?: string | null;
    status?: TrainingStatus;
}
