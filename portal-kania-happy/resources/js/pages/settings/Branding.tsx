import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

export default function Branding() {
    return (
        <AppLayout breadcrumb={[
            { label: 'Configuration' },
            { label: 'Branding' },
        ]}>
            <Head title="Branding" />
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm text-gray-400">Branding sedang dibangun...</p>
            </div>
        </AppLayout>
    );
}