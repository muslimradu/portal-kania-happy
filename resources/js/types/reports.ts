export interface Pagination<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface GymActivityRow {
    source: 'transaction' | 'attendance';
    ref_uuid: string;
    customer_name: string;
    member_status: 'member' | 'non_member';
    gym_class: string;
    gym_class_id: number | null;
    transaction_date: string;
    transaction_time: string;
    payment_method: 'cash' | 'transfer' | 'qris' | null;
    invoice_number: string | null;
    amount: number;
    created_by: string | null;
}

export interface GymActivityFilters {
    search?: string;
    gym_class_id?: string;
    payment_method?: string;
    member_status?: string;
    date_preset?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_dir?: string;
    [key: string]: unknown;
}

export interface GymActivitySummary {
    today_visitors: number;
    today_revenue: number;
    total_transactions: number;
    most_popular_class: string;
    average_revenue: number;
}

export interface DailyChartPoint {
    date: string;
    visitors: number;
    revenue: number;
    [key: string]: string | number;
}

export interface NameValuePoint {
    name: string;
    value: number;
    [key: string]: string | number;
}

export interface MembershipReportRow {
    uuid: string;
    member_name: string;
    member_phone: string;
    package_name: string;
    purchase_date: string | null;
    activation_date: string | null;
    expired_date: string | null;
    current_status: 'active' | 'expired' | 'cancelled';
    remaining_quota: number | null;
    is_unlimited: boolean;
    last_checkin_at: string | null;
    price: number;
}

export interface MembershipFilters {
    member_search?: string;
    membership_package_id?: string;
    expired_status?: string;
    m_date_preset?: string;
    m_date_from?: string;
    m_date_to?: string;
    m_sort_by?: string;
    m_sort_dir?: string;
    [key: string]: unknown;
}

export interface MembershipSummary {
    total_members: number;
    active_members: number;
    expired_members: number;
    expiring_soon: number;
    new_members_this_month: number;
}

export interface FinancialReportRow {
    uuid: string;
    transaction_date: string;
    invoice_number: string;
    category: 'pos_sale' | 'membership' | 'studio_booking' | 'training';
    category_label: string;
    customer_name: string;
    payment_method: 'cash' | 'transfer' | 'qris' | null;
    amount: number;
    status: string;
    created_by: string;
}

export interface FinancialFilters {
    category?: string;
    gym_class_id?: string;
    membership_package_id?: string;
    training_id?: string;
    payment_method?: string;
    date_preset?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_dir?: string;
    [key: string]: unknown;
}

export interface FinancialSummary {
    today_income: number;
    monthly_income: number;
    cash_income: number;
    transfer_income: number;
    qris_income: number;
    grand_total: number;
}

export interface PeriodComparisonEntry {
    value: number;
    trend: number;
}

export interface PeriodComparison {
    today: PeriodComparisonEntry;
    this_week: PeriodComparisonEntry;
    this_month: PeriodComparisonEntry;
    this_year: PeriodComparisonEntry;
}

export interface RevenueByDayPoint {
    date: string;
    revenue: number;
    [key: string]: string | number;
}

export interface MonthlyRevenuePoint {
    month: string;
    revenue: number;
    [key: string]: string | number;
}

export interface FinancialCharts {
    revenueByDay: RevenueByDayPoint[];
    revenueByCategory: NameValuePoint[];
    paymentMethodDistribution: NameValuePoint[];
    monthlyRevenue: MonthlyRevenuePoint[];
}
