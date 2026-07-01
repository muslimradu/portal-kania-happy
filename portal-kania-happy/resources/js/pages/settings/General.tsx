import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import FormCard from '@/components/shared/FormCard';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generalSettingsSchema, type GeneralSettingsFormValues } from '@/lib/validations/settings';
import { useState } from 'react';

const TIMEZONE_OPTIONS = [
    { value: 'Asia/Jakarta', label: 'WIB — Asia/Jakarta (UTC+7)' },
    { value: 'Asia/Makassar', label: 'WITA — Asia/Makassar (UTC+8)' },
    { value: 'Asia/Jayapura', label: 'WIT — Asia/Jayapura (UTC+9)' },
];

const DATE_FORMAT_OPTIONS = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
    { value: 'D MMMM YYYY', label: 'D MMMM YYYY (31 Desember 2025)' },
];

interface GeneralSettingsProps {
    generalSettings: GeneralSettingsFormValues;
}

export default function General({ generalSettings }: GeneralSettingsProps) {
    const [processing, setProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isDirty },
    } = useForm<GeneralSettingsFormValues>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues: generalSettings,
    });

    const onSubmit = (data: GeneralSettingsFormValues) => {
        setProcessing(true);
        router.patch(route('settings.general.update'), data, {
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => {
                    setError(key as keyof GeneralSettingsFormValues, {
                        type: 'server',
                        message: message as string,
                    });
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumb={[
            { label: 'Configuration' },
            { label: 'General Settings' },
        ]}>
            <Head title="General Settings" />

            <div className="space-y-6">
                <PageHeader
                    title="General Settings"
                    description="Konfigurasi umum aplikasi Portal Kania Happy"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormCard
                        title="Informasi Aplikasi"
                        description="Nama dan tagline yang ditampilkan di seluruh aplikasi"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="app_name">Nama Aplikasi</Label>
                                <Input
                                    id="app_name"
                                    placeholder="Portal Kania Happy"
                                    className="rounded-xl"
                                    {...register('app_name')}
                                />
                                {errors.app_name && (
                                    <p className="text-sm text-red-600">{errors.app_name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="app_tagline">Tagline</Label>
                                <Input
                                    id="app_tagline"
                                    placeholder="Rumah Sehat & Sanggar Senam"
                                    className="rounded-xl"
                                    {...register('app_tagline')}
                                />
                                {errors.app_tagline && (
                                    <p className="text-sm text-red-600">{errors.app_tagline.message}</p>
                                )}
                            </div>
                        </div>
                    </FormCard>

                    <FormCard
                        title="Lokalisasi"
                        description="Pengaturan regional dan format tampilan"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="app_timezone">Timezone</Label>
                                <select
                                    id="app_timezone"
                                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    {...register('app_timezone')}
                                >
                                    {TIMEZONE_OPTIONS.map((tz) => (
                                        <option key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.app_timezone && (
                                    <p className="text-sm text-red-600">{errors.app_timezone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="app_date_format">Format Tanggal</Label>
                                <select
                                    id="app_date_format"
                                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    {...register('app_date_format')}
                                >
                                    {DATE_FORMAT_OPTIONS.map((fmt) => (
                                        <option key={fmt.value} value={fmt.value}>
                                            {fmt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.app_date_format && (
                                    <p className="text-sm text-red-600">{errors.app_date_format.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="app_currency">Mata Uang</Label>
                                <Input
                                    id="app_currency"
                                    placeholder="IDR"
                                    className="rounded-xl"
                                    {...register('app_currency')}
                                />
                                {errors.app_currency && (
                                    <p className="text-sm text-red-600">{errors.app_currency.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="app_phone_prefix">Prefix Telepon</Label>
                                <Input
                                    id="app_phone_prefix"
                                    placeholder="628"
                                    className="rounded-xl"
                                    {...register('app_phone_prefix')}
                                />
                                {errors.app_phone_prefix && (
                                    <p className="text-sm text-red-600">{errors.app_phone_prefix.message}</p>
                                )}
                            </div>
                        </div>
                    </FormCard>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="rounded-xl bg-violet-600 hover:bg-violet-700"
                        >
                            {processing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}