import { Head, Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import AuthSplitLayout from '@/layouts/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFlashToast } from '@/hooks/useFlashToast';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    rememberedEmail?: string;
}

export default function Login({ status, canResetPassword, rememberedEmail }: LoginProps) {
    useFlashToast();
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        setError,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: rememberedEmail ?? '',
            password: '',
            remember: !!rememberedEmail,
        },
    });

    const remember = watch('remember');

    const onSubmit = (data: LoginFormValues) => {
        setProcessing(true);
        router.post(route('login'), data, {
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => {
                    setError(key as keyof LoginFormValues, {
                        type: 'server',
                        message: message as string,
                    });
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthSplitLayout
            title="Selamat Datang Kembali"
            description="Masuk ke akun Anda untuk mengelola Portal Kania Happy"
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="username"
                            autoFocus
                            placeholder="nama@email.com"
                            className="rounded-xl pl-10"
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="rounded-xl pl-10 pr-10"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(checked) =>
                                setValue('remember', checked)
                            }
                        />
                        <Label
                            htmlFor="remember"
                            className="cursor-pointer text-sm font-normal text-gray-600"
                        >
                            Ingat saya
                        </Label>
                    </div>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium transition"
                            style={{ color: 'var(--brand-primary)' }}
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl py-6 text-base font-medium shadow-sm transition"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        'Masuk'
                    )}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}