import {
    LayoutDashboard,
    ShoppingCart,
    Dumbbell,
    Users,
    CalendarCheck,
    FileBarChart,
    Wallet,
    Settings,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    routeName: string;
    disabled?: boolean;
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
        href: '#',
        icon: Settings,
        routeName: 'configuration',
        disabled: true,
        // Will become a sub-menu in Step 8: General Settings, Branding, Payment Configuration
    },
];