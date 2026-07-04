import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import MembershipTab from './components/MembershipTab';
import type { Pagination as PaginationType, MembershipReportRow, MembershipFilters, MembershipSummary } from '@/types/reports';

interface MembershipPackageOption {
    id: number;
    name: string;
}

interface Props {
    data: PaginationType<MembershipReportRow>;
    filters: MembershipFilters;
    summary: MembershipSummary;
    membershipPackages: MembershipPackageOption[];
}

export default function MembershipReport({ data, filters, summary, membershipPackages }: Props) {
    return (
        <AppLayout breadcrumb={[{ label: 'Laporan', href: route('reports.gym-activity.index') }, { label: 'Membership' }]}>
            <Head title="Laporan Membership" />

            <div className="space-y-6">
                <PageHeader title="Membership" description="Laporan data membership dan status keanggotaan member" />
                <MembershipTab data={data} filters={filters} summary={summary} membershipPackages={membershipPackages} />
            </div>
        </AppLayout>
    );
}
