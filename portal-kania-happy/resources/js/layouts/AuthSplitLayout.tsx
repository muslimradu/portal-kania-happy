import { PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import AppLogo from '@/components/AppLogo';
import { Heart, Sparkles, Dumbbell } from 'lucide-react';

interface AuthSplitLayoutProps extends PropsWithChildren {
    title: string;
    description: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthSplitLayoutProps) {
    const { settings } = usePage().props as any;

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Gradient Branding */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 p-12 text-white lg:flex">
                {/* Decorative background circles */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-32 -right-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-violet-700 shadow-lg">
                            KH
                        </div>
                        <div>
                            <p className="text-lg font-bold leading-tight">
                                {settings?.app_name ?? 'Portal Kania Happy'}
                            </p>
                            <p className="text-sm text-violet-200">
                                {settings?.app_tagline ?? 'Rumah Sehat & Sanggar Senam'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8 flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <Heart className="h-8 w-8" />
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <Dumbbell className="h-8 w-8" />
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <Sparkles className="h-8 w-8" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Kelola Gym & Sanggar Senam
                        <br />
                        dengan Lebih Mudah
                    </h2>
                    <p className="mt-4 max-w-md text-violet-100">
                        Sistem manajemen membership terpadu untuk mendukung
                        gaya hidup sehat para member Kania Happy.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-violet-200">
                    © {new Date().getFullYear()} Portal Kania Happy. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8 flex justify-center lg:hidden">
                        <AppLogo size="lg" />
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        <p className="mt-2 text-sm text-gray-500">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}