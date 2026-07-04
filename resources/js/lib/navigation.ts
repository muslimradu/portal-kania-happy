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
    Package,
    UserCheck,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    routeName: string;
    permission?: string | string[];
    disabled?: boolean;
    children?: NavItem[];
}

export const navigationItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        routeName: 'dashboard',
        permission: 'dashboard.view',
    },
    {
        label: 'Kasir',
        href: '/cashier',
        icon: ShoppingCart,
        routeName: 'cashier.index',
        permission: 'cashier.view',
    },
    {
        label: 'Senam',
        href: '/gym-classes',
        icon: Dumbbell,
        routeName: 'gym-classes',
        permission: 'gym_classes.view',
    },
    {
        label: 'Membership',
        href: '/members',
        icon: Users,
        routeName: 'member',
        children: [
            {
                label: 'Daftar Member',
                href: '/members',
                icon: Users,
                routeName: 'members.index',
                permission: 'members.view',
            },
            {
                label: 'Paket Membership',
                href: '/membership-packages',
                icon: Package,
                routeName: 'membership-packages',
                permission: 'membership_packages.view',
            },
        ],
    },
    {
        label: 'Booking Sanggar',
        href: '/bookings',
        icon: CalendarCheck,
        routeName: 'bookings.index',
        permission: 'studio_bookings.view',
    },
    {
        label: 'Laporan',
        href: '/reports/gym-activity',
        icon: FileBarChart,
        routeName: 'reports',
        children: [
            {
                label: 'Gym Activity',
                href: '/reports/gym-activity',
                icon: Dumbbell,
                routeName: 'reports.gym-activity.index',
                permission: 'reports.gym_activity.view',
            },
            {
                label: 'Membership',
                href: '/reports/membership',
                icon: UserCheck,
                routeName: 'reports.membership.index',
                permission: 'reports.membership.view',
            },
        ],
    },
    {
        label: 'Laporan Keuangan',
        href: '/financial-reports',
        icon: Wallet,
        routeName: 'financial-reports.index',
        permission: 'financial_reports.view',
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
                permission: 'settings.view',
            },
            {
                label: 'Branding',
                href: '/settings/branding',
                icon: Palette,
                routeName: 'settings.branding',
                permission: 'settings.view',
            },
            {
                label: 'Payment Configuration',
                href: '/settings/payment',
                icon: CreditCard,
                routeName: 'settings.payment',
                permission: 'payment_configurations.view',
            },
        ],
    },
];