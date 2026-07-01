import {
    LayoutDashboard,
    ShoppingCart,
    Dumbbell,
    Users,
    CalendarCheck,
    FileBarChart,
    Wallet,
    Settings,
    SlidersHorizontal,
    Palette,
    CreditCard,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    routeName: string;
    disabled?: boolean;
    children?: NavItem[];
}

export const navigationItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        routeName: 'dashboard',
    },
    {
        label: 'Kasir',
        href: '#',
        icon: ShoppingCart,
        routeName: 'kasir',
        disabled: true,
    },
    {
        label: 'Senam',
        href: '#',
        icon: Dumbbell,
        routeName: 'senam',
        disabled: true,
    },
    {
        label: 'Member',
        href: '#',
        icon: Users,
        routeName: 'member',
        disabled: true,
    },
    {
        label: 'Booking Sanggar',
        href: '#',
        icon: CalendarCheck,
        routeName: 'booking',
        disabled: true,
    },
    {
        label: 'Laporan',
        href: '#',
        icon: FileBarChart,
        routeName: 'laporan',
        disabled: true,
    },
    {
        label: 'Laporan Keuangan',
        href: '#',
        icon: Wallet,
        routeName: 'laporan-keuangan',
        disabled: true,
    },
    {
        label: 'Configuration',
        href: '/settings/general',
        icon: Settings,
        routeName: 'settings',
        children: [
            {
                label: 'General Settings',
                href: '/settings/general',
                icon: SlidersHorizontal,
                routeName: 'settings.general',
            },
            {
                label: 'Branding',
                href: '/settings/branding',
                icon: Palette,
                routeName: 'settings.branding',
            },
            {
                label: 'Payment Configuration',
                href: '#',
                icon: CreditCard,
                routeName: 'settings.payment',
                disabled: true,
            },
        ],
    },
];