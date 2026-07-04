import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    UserX,
    Dumbbell,
    CalendarCheck,
    Wallet,
    TrendingUp,
    Activity,
    AlertTriangle,
    BookOpen,
    UserPlus,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import StatCard from '@/components/shared/StatCard';
import SectionCard from '@/components/shared/SectionCard';
import EmptyState from '@/components/shared/EmptyState';
import ChartCard from '@/components/shared/charts/ChartCard';
import SimpleLineChart from '@/components/shared/charts/SimpleLineChart';
import SimplePieChart from '@/components/shared/charts/SimplePieChart';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useDateTime } from '@/hooks/useDateTime';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { PAYMENT_STATUS_LABELS, STATUS_LABELS, formatTime, paymentBadgeStyle, statusBadgeStyle } from '@/pages/bookings/bookingHelpers';
import type { PageProps } from '@/types';
import type { StudioBooking } from '@/types/booking';
import type { NameValuePoint, RevenueByDayPoint } from '@/types/reports';

interface DashboardStats {
    total_members: number;
    expired_members: number;
    today_classes: number;
    today_bookings: number;
    monthly_bookings: number;
    today_revenue: number;
    monthly_revenue: number;
    new_members_this_month: number;
}

interface RecentActivityItem {
    uuid: string;
    module: string;
    action: string;
    description: string | null;
    user_name: string;
    created_at: string;
}

interface UpcomingExpiredMember {
    member_uuid: string | null;
    member_name: string;
    package_name: string;
    end_date: string | null;
}

interface DashboardProps {
    stats: DashboardStats;
    recent_activity: RecentActivityItem[];
    upcoming_expired_members: UpcomingExpiredMember[];
    recent_bookings: StudioBooking[];
    revenue_last_7_days: RevenueByDayPoint[];
    top_classes: NameValuePoint[];
    payment_distribution: NameValuePoint[];
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { stats, recent_activity, upcoming_expired_members, recent_bookings, revenue_last_7_days, top_classes, payment_distribution } =
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
                        description="Member terdaftar"
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
                        description="Kunjungan kelas hari ini"
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
                        title="Booking Bulan Ini"
                        value={stats.monthly_bookings}
                        icon={CalendarCheck}
                        description="Total booking sanggar bulan ini"
                        color="blue"
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

                {/* Analytics Widgets */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ChartCard
                        title="Pendapatan 7 Hari Terakhir"
                        className="lg:col-span-2"
                        isEmpty={revenue_last_7_days.every((d) => d.revenue === 0)}
                    >
                        <SimpleLineChart data={revenue_last_7_days} xKey="date" yKey="revenue" valueFormatter={formatCurrency} />
                    </ChartCard>
                    <ChartCard title="Distribusi Pembayaran" description="Bulan ini" isEmpty={payment_distribution.length === 0}>
                        <SimplePieChart data={payment_distribution} valueFormatter={formatCurrency} />
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ChartCard title="Top 5 Senam Terlaris" isEmpty={top_classes.length === 0}>
                        <SimplePieChart data={top_classes} />
                    </ChartCard>

                    <StatCard
                        title="Member Baru Bulan Ini"
                        value={stats.new_members_this_month}
                        icon={UserPlus}
                        description="Pendaftaran baru bulan berjalan"
                        color="green"
                    />

                    {/* Upcoming Expired Members */}
                    <SectionCard
                        title="⚠ Member Akan Expired"
                        description="Masa aktif habis dalam 7 hari"
                        action={
                            <Link
                                href={`${route('reports.membership.index')}?expired_status=expiring_in_7_days`}
                                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                            >
                                Lihat Semua
                            </Link>
                        }
                    >
                        {upcoming_expired_members.length === 0 ? (
                            <EmptyState
                                icon={AlertTriangle}
                                title="Tidak ada member yang akan expired"
                                description="Daftar member yang mendekati masa expired akan muncul di sini."
                            />
                        ) : (
                            <div className="space-y-3">
                                {upcoming_expired_members.map((member, idx) => (
                                    <div key={member.member_uuid ?? idx} className="rounded-xl border border-gray-100 p-3">
                                        <p className="text-sm font-medium text-gray-900">{member.member_name}</p>
                                        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                                            <span>{member.package_name}</span>
                                            <span className="font-medium text-orange-500">{formatDateShort(member.end_date)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Widgets */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Recent Activity */}
                    <SectionCard title="Aktivitas Terbaru" description="Log aktivitas sistem terkini">
                        {recent_activity.length === 0 ? (
                            <EmptyState
                                icon={Activity}
                                title="Belum ada aktivitas"
                                description="Aktivitas sistem akan muncul di sini setelah ada transaksi atau perubahan data."
                            />
                        ) : (
                            <div className="space-y-3">
                                {recent_activity.map((activity) => (
                                    <div key={activity.uuid} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                                        <div
                                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)', color: 'var(--brand-primary)' }}
                                        >
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{activity.description ?? activity.action}</p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {activity.user_name} · {new Date(activity.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Recent Bookings */}
                    <SectionCard title="Booking Terbaru" description="Riwayat booking sanggar terkini">
                        {recent_bookings.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada booking"
                                description="Riwayat booking sanggar akan muncul di sini."
                            />
                        ) : (
                            <div className="space-y-3">
                                {recent_bookings.map((booking) => (
                                    <Link
                                        key={booking.uuid}
                                        href={route('bookings.index')}
                                        className="block rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:bg-gray-50/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                                            <Badge className="rounded-full text-white" style={statusBadgeStyle(booking.status)}>
                                                {STATUS_LABELS[booking.status]}
                                            </Badge>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                                            <span>
                                                {new Date(booking.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ·{' '}
                                                {formatTime(booking.start_time)}-{formatTime(booking.end_time)}
                                            </span>
                                            <Badge className="rounded-full text-white" style={paymentBadgeStyle(booking.payment_status)}>
                                                {PAYMENT_STATUS_LABELS[booking.payment_status]}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}
