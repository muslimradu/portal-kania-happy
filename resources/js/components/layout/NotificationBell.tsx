import { router, usePage } from '@inertiajs/react';
import { Bell, CalendarCheck, GraduationCap, UserX } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDismissedNotifications } from '@/hooks/useDismissedNotifications';
import type { AppNotification } from '@/types/notification';

const TYPE_ICON = {
    training: GraduationCap,
    booking: CalendarCheck,
    membership: UserX,
} as const;

const TYPE_LABEL = {
    training: 'Pelatihan',
    booking: 'Booking',
    membership: 'Membership',
} as const;

const BADGE_STYLE: Record<string, string> = {
    'Hari H': '#DC2626',
    'H-1': '#EA580C',
    'H-3': '#D97706',
    'H-7': '#CA8A04',
};

export default function NotificationBell() {
    const { props } = usePage();
    const notifications = ((props as { notifications?: AppNotification[] }).notifications ?? []) as AppNotification[];
    const allIds = useMemo(() => notifications.map((item) => item.id), [notifications]);
    const { dismiss, isDismissed } = useDismissedNotifications(allIds);

    const unread = notifications.filter((item) => !isDismissed(item.id));
    const count = unread.length;

    const handleNotificationClick = (item: AppNotification) => {
        dismiss(item.id);
        router.visit(item.href);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    aria-label="Notifikasi"
                >
                    <Bell className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {count > 9 ? '9+' : count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-900">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Pemberitahuan
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {unread.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-gray-400">
                        {notifications.length === 0
                            ? 'Tidak ada pemberitahuan saat ini.'
                            : 'Semua pemberitahuan sudah dibaca.'}
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {unread.map((item) => {
                            const Icon = TYPE_ICON[item.type];

                            return (
                                <DropdownMenuGroup key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleNotificationClick(item)}
                                        className="flex w-full gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div
                                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                                                color: 'var(--brand-primary)',
                                            }}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {item.title}
                                                </p>
                                                <Badge
                                                    className="shrink-0 rounded-full text-[10px] text-white"
                                                    style={{ backgroundColor: BADGE_STYLE[item.badge] ?? '#6B7280' }}
                                                >
                                                    {item.badge}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.message}</p>
                                            {item.subtitle && (
                                                <p className="mt-0.5 text-xs text-gray-400">{item.subtitle}</p>
                                            )}
                                            <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-300 dark:text-gray-500">
                                                {TYPE_LABEL[item.type]}
                                            </p>
                                        </div>
                                    </button>
                                </DropdownMenuGroup>
                            );
                        })}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
