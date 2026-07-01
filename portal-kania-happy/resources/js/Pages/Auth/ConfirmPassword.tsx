import { Head, useForm } from '@inertiajs/react';
import { Loader2, Lock } from 'lucide-react';
import { FormEventHandler } from 'react';
import AuthSplitLayout from '@/layouts/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({ password: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <AuthSplitLayout
            title="Konfirmasi Password"
            description="Masukkan password Anda untuk melanjutkan"
        >
            <Head title="Konfirmasi Password" />

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-xl pl-10"
                            autoFocus
                        />
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-violet-600 py-6 text-base font-medium hover:bg-violet-700"
                >
                    {processing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                    ) : (
                        'Konfirmasi'
                    )}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}