import { Head, useForm } from '@inertiajs/react';
import { Loader2, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';
import AuthSplitLayout from '@/layouts/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthSplitLayout
            title="Lupa Password"
            description="Masukkan email Anda untuk menerima link reset password"
        >
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            className="rounded-xl pl-10"
                            autoFocus
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-violet-600 py-6 text-base font-medium hover:bg-violet-700"
                >
                    {processing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
                    ) : (
                        'Kirim Link Reset Password'
                    )}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}