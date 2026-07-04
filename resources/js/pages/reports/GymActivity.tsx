import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import GymActivityTab from './components/GymActivityTab';
import type { Pagination as PaginationType, GymActivityRow, GymActivityFilters, GymActivitySummary } from '@/types/reports';

interface GymClassOption {
    id: number;
    name: string;
}

interface Props {
    data: PaginationType<GymActivityRow>;
    filters: GymActivityFilters;
    summary: GymActivitySummary;
    gymClasses: GymClassOption[];
}

export default function GymActivityReport({ data, filters, summary, gymClasses }: Props) {
    return (
        <AppLayout breadcrumb={[{ label: 'Laporan', href: route('reports.gym-activity.index') }, { label: 'Gym Activity' }]}>
            <Head title="Laporan Gym Activity" />

            <div className="space-y-6">
                <PageHeader title="Gym Activity" description="Laporan transaksi kasir dan check-in member berbasis data real" />
                <GymActivityTab data={data} filters={filters} summary={summary} gymClasses={gymClasses} />
            </div>
        </AppLayout>
    );
}
