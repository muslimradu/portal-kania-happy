import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Dumbbell, Pencil, History, ShoppingBag, StickyNote } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmptyState from '@/components/shared/EmptyState';
import MembershipQuotaDialog from './components/MembershipQuotaDialog';
import type { Member } from '@/types/member';
import type { Membership } from '@/types/membership';
import { formatMemberMembershipExpiry } from '@/lib/membership-expiry';

interface Props {
    member: Member;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateTime(value: string): string {
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const PAYMENT_LABELS: Record<string, string> = { cash: 'Cash', transfer: 'Transfer', qris: 'QRIS' };
const STATUS_COLORS: Record<string, string> = { active: '#16a34a', expired: '#6b7280', cancelled: '#dc2626' };
const STATUS_LABELS: Record<string, string> = { active: 'Aktif', expired: 'Expired', cancelled: 'Dibatalkan' };

export default function MemberShow({ member }: Props) {
    const activeMemberships = (member.memberships ?? []).filter((m) => m.status === 'active');
    const [quotaTarget, setQuotaTarget] = useState<Membership | undefined>();

    return (
        <AppLayout breadcrumb={[{ label: 'Daftar Member', href: route('members.index') }, { label: member.name }]}>
            <Head title={member.name} />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('members.index')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                        <p className="text-sm text-gray-500">{member.phone}</p>
                    </div>
                    <Badge
                        className="ml-2 rounded-full text-white"
                        style={{ backgroundColor: member.is_active ? '#16a34a' : '#6b7280' }}
                    >
                        {member.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    {member.deleted_at && (
                        <Badge className="rounded-full bg-red-50 text-red-500">Dihapus</Badge>
                    )}
                </div>

                <Tabs defaultValue="membership">
                    <TabsList variant="line" className="border-b border-gray-100">
                        <TabsTrigger value="membership">Membership</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="attendance">Absensi</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    {/* Membership Tab */}
                    <TabsContent value="membership" className="mt-4">
                        {activeMemberships.length === 0 ? (
                            <div className="rounded-2xl bg-white shadow-sm">
                                <EmptyState
                                    icon={Dumbbell}
                                    title="Belum ada membership aktif"
                                    description="Member ini belum memiliki paket membership yang sedang aktif."
                                />
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {activeMemberships.map((membership) => (
                                    <div key={membership.uuid} className="rounded-xl bg-white p-3.5 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900">{membership.package_name}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    {formatMemberMembershipExpiry(
                                                        membership.start_date,
                                                        membership.end_date,
                                                        membership.membership_package,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <Badge
                                                    className="rounded-full text-[11px] text-white"
                                                    style={{ backgroundColor: STATUS_COLORS[membership.status] }}
                                                >
                                                    {STATUS_LABELS[membership.status]}
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                                    onClick={() => setQuotaTarget(membership)}
                                                    title="Edit paket"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2.5 space-y-1.5">
                                            {membership.details.map((detail) => (
                                                <div key={detail.uuid} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs">
                                                    <span className="flex items-center gap-1.5 text-gray-700">
                                                        <span
                                                            className="h-2 w-2 shrink-0 rounded-full"
                                                            style={{ backgroundColor: detail.gym_class?.color_label ?? '#6b7280' }}
                                                        />
                                                        {detail.class_name}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {detail.is_unlimited ? 'Unlimited' : `${detail.quota_used}/${detail.quota}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-4">
                        <div className="rounded-2xl bg-white shadow-sm">
                            {(member.invoices ?? []).length === 0 ? (
                                <EmptyState
                                    icon={StickyNote}
                                    title="Belum ada riwayat pembelian"
                                    description="Riwayat transaksi member akan muncul di sini."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Tanggal Beli</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Paket</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Pembayaran</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Jumlah</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">No. Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(member.invoices ?? []).map((invoice) => (
                                                <tr key={invoice.uuid} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 text-gray-600">{formatDate(invoice.created_at)}</td>
                                                    <td className="px-4 py-3 text-gray-900">
                                                        {(invoice.memberships ?? []).map((m) => m.package_name).join(', ')}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{PAYMENT_LABELS[invoice.payment_method]}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(Number(invoice.total_amount))}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            className="rounded-full text-white"
                                                            style={{ backgroundColor: invoice.status === 'paid' ? '#16a34a' : invoice.status === 'pending' ? '#f59e0b' : '#dc2626' }}
                                                        >
                                                            {invoice.status === 'paid' ? 'Lunas' : invoice.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{invoice.invoice_number}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance" className="mt-4">
                        <div className="rounded-2xl bg-white shadow-sm">
                            {(member.attendances ?? []).length === 0 ? (
                                <EmptyState
                                    icon={History}
                                    title="Belum ada riwayat absensi"
                                    description="Riwayat check-in member akan muncul di sini."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Waktu Check In</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Kelas</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Membership</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Kuota Sebelum</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Kuota Sesudah</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(member.attendances ?? []).map((attendance) => (
                                                <tr key={attendance.uuid} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 text-gray-600">{formatDateTime(attendance.checked_in_at)}</td>
                                                    <td className="px-4 py-3 text-gray-900">{attendance.class_name}</td>
                                                    <td className="px-4 py-3 text-gray-600">{attendance.package_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {attendance.is_unlimited ? 'Unlimited' : (attendance.quota_before ?? '-')}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {attendance.is_unlimited ? 'Unlimited' : (attendance.quota_after ?? '-')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="mt-4">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            {(member.timelines ?? []).length === 0 ? (
                                <EmptyState
                                    icon={ShoppingBag}
                                    title="Belum ada aktivitas"
                                    description="Aktivitas pembelian dan check-in member akan muncul di sini."
                                />
                            ) : (
                                <div className="space-y-0">
                                    {(member.timelines ?? []).map((timeline, index) => (
                                        <div key={timeline.uuid} className="relative flex gap-4 pb-6 last:pb-0">
                                            {index < (member.timelines ?? []).length - 1 && (
                                                <div className="absolute left-[15px] top-8 h-full w-px bg-gray-100" />
                                            )}
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                                                style={{ backgroundColor: timeline.type === 'purchase' ? '#f59e0b' : 'var(--brand-primary)' }}
                                            >
                                                {timeline.type === 'purchase' ? (
                                                    <ShoppingBag className="h-4 w-4" />
                                                ) : (
                                                    <Dumbbell className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1">
                                                <p className="text-sm font-semibold text-gray-900">{timeline.title}</p>
                                                {timeline.description && (
                                                    <p className="text-xs text-gray-500">{timeline.description}</p>
                                                )}
                                                <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(timeline.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {quotaTarget && (
                <MembershipQuotaDialog
                    open={!!quotaTarget}
                    onOpenChange={(open) => !open && setQuotaTarget(undefined)}
                    membership={quotaTarget}
                />
            )}
        </AppLayout>
    );
}
