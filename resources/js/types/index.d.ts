export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    roles: string[];
    permissions: string[];
}

export interface AppSettings {
    app_name?: string;
    app_tagline?: string;
    app_primary_color?: string;
    app_logo?: string | null;
    app_favicon?: string | null;
    app_currency?: string;
    app_date_format?: string;
    app_phone_prefix?: string;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    name: string;
    auth: {
        user: User;
    };
    settings: AppSettings;
    flash: FlashMessages;
};