import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, RotateCcw, Users, Download } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MemberFormDialog from './components/MemberFormDialog';
import RegistrationDialog from './components/RegistrationDialog';
import type { Member, MemberPagination, MemberFilters } from '@/types/member';
import type { MembershipPackage } from '@/types/membership-package';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface Props {
    members: MemberPagination;
    filters: MemberFilters;
    packages: MembershipPackage[];
    paymentConfigurations: PaymentConfiguration[];
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MemberIndex({ members, filters, packages, paymentConfigurations }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Member | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<Member | undefined>();
    const [restoreTarget, setRestoreTarget] = useState<Member | undefined>();
    const [processing, setProcessing] = useState(false);

    const applyFilters = (params: Partial<MemberFilters>) => {
        router.get(route('members.index'), { ...filters, ...params, page: 1 }, { preserveState: true, replace: true });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        applyFilters({ status: value });
    };

    const handleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: dir });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(route('members.destroy', deleteTarget.uuid), {
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setProcessing(true);
        router.patch(route('members.restore', restoreTarget.uuid), {}, {
            onSuccess: () => setRestoreTarget(undefined),
            onFinish: () => setProcessing(false),
        });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (filters.sort_by !== column) return <span className="ml-1 text-gray-300">↕</span>;
        return <span className="ml-1">{filters.sort_dir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Daftar Member' }]}>
            <Head title="Daftar Member" />
            <div className="space-y-6">
                <PageHeader
                    title="Daftar Member"
                    description="Kelola data member dan keanggotaan gym"
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => window.open(route('members.export'), '_blank')}
                                className="rounded-xl"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Member
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.open(route('members.memberships.export'), '_blank')}
                                className="rounded-xl"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Membership
                            </Button>
                            <Button
                                onClick={() => setRegistrationOpen(true)}
                                className="rounded-xl"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Member
                            </Button>
                        </div>
                    }
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari nama atau nomor telepon..."
                        className="w-full sm:w-72"
                    />
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: '', label: 'Semua' },
                            { value: 'active', label: 'Aktif' },
                            { value: 'inactive', label: 'Nonaktif' },
                            { value: 'trashed', label: 'Dihapus' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleStatusFilter(opt.value)}
                                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${status === opt.value ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                                style={status === opt.value ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-white shadow-sm">
                    {members.data.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Belum ada member"
                            description="Tambahkan member baru untuk mulai mengelola keanggotaan."
                            action={{ label: 'Tambah Member', onClick: () => setRegistrationOpen(true) }}
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600" onClick={() => handleSort('name')}>
                                                Nama <SortIcon column="name" />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Telepon
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Membership Aktif
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Status
                                            </th>
                                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600" onClick={() => handleSort('created_at')}>
                                                Dibuat <SortIcon column="created_at" />
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.data.map((member) => (
                                            <tr
                                                key={member.uuid}
                                                className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50/50 ${member.deleted_at ? 'opacity-60' : ''}`}
                                                onClick={() => router.get(route('members.show', member.uuid))}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">
                                                        {member.name}
                                                        {member.deleted_at && (
                                                            <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-500">Dihapus</span>
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{member.phone}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className="rounded-full bg-violet-50 text-violet-700">
                                                        {member.active_memberships_count ?? 0} Membership
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className="rounded-full text-white"
                                                        style={{ backgroundColor: member.is_active ? '#16a34a' : '#6b7280' }}
                                                    >
                                                        {member.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{formatDate(member.created_at)}</td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        {member.deleted_at ? (
                                                            <Button size="sm" variant="ghost" onClick={() => setRestoreTarget(member)} className="rounded-lg text-green-600 hover:bg-green-50">
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button size="sm" variant="ghost" onClick={() => setEditTarget(member)} className="rounded-lg text-gray-500 hover:bg-gray-100">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(member)} className="rounded-lg text-red-500 hover:bg-red-50">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {members.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                                    <p className="text-sm text-gray-500">
                                        Menampilkan {members.from}–{members.to} dari {members.total} member
                                    </p>
                                    <div className="flex gap-1">
                                        {Array.from({ length: members.last_page }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => router.get(route('members.index'), { ...filters, page })}
                                                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${page === members.current_page ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                style={page === members.current_page ? { backgroundColor: 'var(--brand-primary)' } : {}}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <RegistrationDialog
                open={registrationOpen}
                onOpenChange={setRegistrationOpen}
                packages={packages}
                paymentConfigurations={paymentConfigurations}
            />

            {editTarget && (
                <MemberFormDialog
                    open={!!editTarget}
                    onOpenChange={(open) => !open && setEditTarget(undefined)}
                    member={editTarget}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(undefined)}
                title="Hapus Member?"
                description={`Member "${deleteTarget?.name}" akan dihapus. Data dapat dipulihkan kembali.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={processing}
                onConfirm={handleDelete}
            />

            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(undefined)}
                title="Pulihkan Member?"
                description={`Member "${restoreTarget?.name}" akan dipulihkan.`}
                confirmLabel="Ya, Pulihkan"
                variant="default"
                processing={processing}
                onConfirm={handleRestore}
            />
        </AppLayout>
    );
}
