import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

export default function General() {
    return (
        <AppLayout breadcrumb={[
            { label: 'Configuration' },
            { label: 'General Settings' },
        ]}>
            <Head title="General Settings" />
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm text-gray-400">General Settings sedang dibangun...</p>
            </div>
        </AppLayout>
    );
}