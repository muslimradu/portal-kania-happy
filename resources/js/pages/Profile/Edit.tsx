import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppLayout breadcrumb={[{ label: 'Profil Saya' }]}>
            <Head title="Profil Saya" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}