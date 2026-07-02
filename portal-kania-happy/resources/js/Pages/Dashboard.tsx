import { Head, usePage } from '@inertiajs/react';
import {
    Users,
    UserX,
    Dumbbell,
    CalendarCheck,
    Wallet,
    TrendingUp,
    Activity,
    Clock,
    BookOpen,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import StatCard from '@/components/shared/StatCard';
import SectionCard from '@/components/shared/SectionCard';
import EmptyState from '@/components/shared/EmptyState';
import { useDateTime } from '@/hooks/useDateTime';
import type { PageProps } from '@/types';

interface DashboardStats {
    total_members: number;
    expired_members: number;
    today_classes: number;
    today_bookings: number;
    today_revenue: number;
    monthly_revenue: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recent_activity: never[];
    upcoming_expired_members: never[];
    recent_bookings: never[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { stats, recent_activity, upcoming_expired_members, recent_bookings } =
        props as unknown as DashboardProps;
    const { auth } = props;
    const { date, time } = useDateTime();

    const firstName = auth.user?.name?.split(' ')[0] ?? 'Admin';

    return (
        <AppLayout breadcrumb={[{ label: 'Dashboard' }]}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header Greeting */}
                <div className="rounded-2xl p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 70%, black))' }}>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Halo, {firstName}! 👋
                            </h1>
                            <p className="mt-1 text-violet-200">
                                Selamat datang kembali di Portal Kania Happy
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold tabular-nums">{time}</p>
                            <p className="mt-1 text-sm capitalize text-violet-200">{date}</p>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        title="Total Member"
                        value={stats.total_members}
                        icon={Users}
                        description="Member aktif terdaftar"
                        color="violet"
                    />
                    <StatCard
                        title="Member Expired"
                        value={stats.expired_members}
                        icon={UserX}
                        description="Masa aktif habis"
                        color="red"
                    />
                    <StatCard
                        title="Kelas Hari Ini"
                        value={stats.today_classes}
                        icon={Dumbbell}
                        description="Jadwal senam hari ini"
                        color="blue"
                    />
                    <StatCard
                        title="Booking Hari Ini"
                        value={stats.today_bookings}
                        icon={CalendarCheck}
                        description="Booking sanggar hari ini"
                        color="green"
                    />
                    <StatCard
                        title="Pendapatan Hari Ini"
                        value={formatCurrency(stats.today_revenue)}
                        icon={Wallet}
                        description="Total transaksi hari ini"
                        color="orange"
                    />
                    <StatCard
                        title="Pendapatan Bulan Ini"
                        value={formatCurrency(stats.monthly_revenue)}
                        icon={TrendingUp}
                        description="Total transaksi bulan ini"
                        color="violet"
                    />
                </div>

                {/* Widgets */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Recent Activity */}
                    <SectionCard
                        title="Aktivitas Terbaru"
                        description="Log aktivitas sistem terkini"
                        className="lg:col-span-1"
                    >
                        {recent_activity.length === 0 ? (
                            <EmptyState
                                icon={Activity}
                                title="Belum ada aktivitas"
                                description="Aktivitas sistem akan muncul di sini setelah ada transaksi atau perubahan data."
                            />
                        ) : null}
                    </SectionCard>

                    {/* Upcoming Expired Members */}
                    <SectionCard
                        title="Member Akan Expired"
                        description="Member yang masa aktifnya akan segera habis"
                        className="lg:col-span-1"
                    >
                        {upcoming_expired_members.length === 0 ? (
                            <EmptyState
                                icon={Clock}
                                title="Tidak ada member yang akan expired"
                                description="Daftar member yang mendekati masa expired akan muncul di sini."
                            />
                        ) : null}
                    </SectionCard>

                    {/* Recent Bookings */}
                    <SectionCard
                        title="Booking Terbaru"
                        description="Riwayat booking sanggar terkini"
                        className="lg:col-span-1"
                    >
                        {recent_bookings.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada booking"
                                description="Riwayat booking sanggar akan muncul di sini."
                            />
                        ) : null}
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}