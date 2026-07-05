export type NotificationType = 'training' | 'booking' | 'membership';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    subtitle: string | null;
    href: string;
    badge: string;
    date: string;
    priority: number;
}
