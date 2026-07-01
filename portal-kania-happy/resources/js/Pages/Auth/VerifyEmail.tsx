import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';
import AuthSplitLayout from '@/layouts/AuthSplitLayout';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthSplitLayout
            title="Verifikasi Email"
            description="Periksa email Anda untuk link verifikasi"
        >
            <Head title="Verifikasi Email" />

            <div className="mb-4 rounded-xl bg-violet-50 p-4 text-center">
                <Mail className="mx-auto mb-2 h-8 w-8 text-violet-500" />
                <p className="text-sm text-gray-600">
                    Kami telah mengirimkan link verifikasi ke email Anda.
                    Silakan cek inbox atau folder spam.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Link verifikasi baru telah dikirim ke email Anda.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-violet-600 py-6 text-base font-medium hover:bg-violet-700"
                >
                    {processing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
                    ) : (
                        'Kirim Ulang Email Verifikasi'
                    )}
                </Button>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Keluar
                    </Link>
                </div>
            </form>
        </AuthSplitLayout>
    );
}