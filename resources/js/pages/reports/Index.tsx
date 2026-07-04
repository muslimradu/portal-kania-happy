import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GymActivityTab from './components/GymActivityTab';
import MembershipTab from './components/MembershipTab';
import type { Pagination as PaginationType, GymActivityRow, GymActivityFilters, GymActivitySummary, MembershipReportRow, MembershipFilters, MembershipSummary } from '@/types/reports';

interface GymClassOption {
    id: number;
    name: string;
}

interface MembershipPackageOption {
    id: number;
    name: string;
}

interface Props {
    tab: 'gym_activity' | 'membership';
    gymActivity: {
        data: PaginationType<GymActivityRow>;
        filters: GymActivityFilters;
        summary: GymActivitySummary;
    };
    membership: {
        data: PaginationType<MembershipReportRow>;
        filters: MembershipFilters;
        summary: MembershipSummary;
    };
    gymClasses: GymClassOption[];
    membershipPackages: MembershipPackageOption[];
}

export default function ReportsIndex({ tab, gymActivity, membership, gymClasses, membershipPackages }: Props) {
    const switchTab = (value: string) => {
        router.get(route('reports.index'), { tab: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumb={[{ label: 'Laporan' }]}>
            <Head title="Laporan" />

            <div className="space-y-6">
                <PageHeader title="Laporan" description="Laporan aktivitas gym dan membership berbasis data real" />

                <Tabs value={tab} onValueChange={switchTab}>
                    <TabsList>
                        <TabsTrigger value="gym_activity">Gym Activity</TabsTrigger>
                        <TabsTrigger value="membership">Membership</TabsTrigger>
                    </TabsList>

                    <TabsContent value="gym_activity" className="mt-4">
                        <GymActivityTab
                            data={gymActivity.data}
                            filters={gymActivity.filters}
                            summary={gymActivity.summary}
                            gymClasses={gymClasses}
                        />
                    </TabsContent>

                    <TabsContent value="membership" className="mt-4">
                        <MembershipTab
                            data={membership.data}
                            filters={membership.filters}
                            summary={membership.summary}
                            membershipPackages={membershipPackages}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
