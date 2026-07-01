import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

export default function Dashboard() {
    return (
        <AppLayout breadcrumb={[{ label: 'Dashboard' }]}>
            <Head title="Dashboard" />
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm text-gray-400">Dashboard sedang dibangun...</p>
            </div>
        </AppLayout>
    );
}