import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Palette } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormCard from '@/components/shared/FormCard';
import PageHeader from '@/components/shared/PageHeader';
import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { brandingSettingsSchema, type BrandingSettingsFormValues } from '@/lib/validations/settings';

interface BrandingSettingsProps {
    brandingSettings: {
        app_primary_color: string;
        app_logo: string | null;
        app_favicon: string | null;
    };
}

export default function Branding({ brandingSettings }: BrandingSettingsProps) {
    const [processing, setProcessing] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        brandingSettings.app_logo
            ? `/storage/${brandingSettings.app_logo}`
            : null,
    );
    const [faviconPreview, setFaviconPreview] = useState<string | null>(
        brandingSettings.app_favicon
            ? `/storage/${brandingSettings.app_favicon}`
            : null,
    );

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<BrandingSettingsFormValues>({
        resolver: zodResolver(brandingSettingsSchema),
        defaultValues: {
            app_primary_color: brandingSettings.app_primary_color ?? '#7C3AED',
        },
    });

    const primaryColor = watch('app_primary_color');

    const onSubmit = (data: BrandingSettingsFormValues) => {
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('app_primary_color', data.app_primary_color);

        const logoInput = document.getElementById('app_logo') as HTMLInputElement;
        const faviconInput = document.getElementById('app_favicon') as HTMLInputElement;

        if (logoInput?.files?.[0]) {
            formData.append('app_logo', logoInput.files[0]);
        }
        if (faviconInput?.files?.[0]) {
            formData.append('app_favicon', faviconInput.files[0]);
        }

        router.post(route('settings.branding.update'), formData, {
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => {
                    setError(key as keyof BrandingSettingsFormValues, {
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
            { label: 'Branding' },
        ]}>
            <Head title="Branding" />

            <div className="space-y-6">
                <PageHeader
                    title="Branding"
                    description="Kustomisasi tampilan dan identitas visual Portal Kania Happy"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Preview Card */}
                    <FormCard
                        title="Preview Branding"
                        description="Tampilan branding saat ini"
                    >
                        <div
                            className="flex items-center gap-4 rounded-xl p-6"
                            style={{ backgroundColor: primaryColor + '15' }}
                        >
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-2xl font-bold text-white text-xl shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                KH
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Portal Kania Happy</p>
                                <p className="text-sm text-gray-500">Rumah Sehat & Sanggar Senam</p>
                                <div
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Palette className="h-3 w-3" />
                                    {primaryColor}
                                </div>
                            </div>
                        </div>
                    </FormCard>

                    {/* Warna Utama */}
                    <FormCard
                        title="Warna Utama"
                        description="Warna brand yang digunakan di seluruh aplikasi"
                    >
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                className="h-12 w-12 cursor-pointer rounded-xl border border-input p-1"
                                {...register('app_primary_color')}
                            />
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="app_primary_color_text">Kode Hex</Label>
                                <Input
                                    id="app_primary_color_text"
                                    placeholder="#7C3AED"
                                    className="rounded-xl"
                                    {...register('app_primary_color')}
                                />
                            </div>
                        </div>
                        {errors.app_primary_color && (
                            <p className="mt-2 text-sm text-red-600">{errors.app_primary_color.message}</p>
                        )}
                    </FormCard>

                    {/* Logo */}
                    <FormCard
                        title="Logo Aplikasi"
                        description="Logo yang ditampilkan di sidebar dan halaman login (PNG, JPG, SVG — maks 2MB)"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                                ) : (
                                    <AppLogo size="md" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="app_logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml"
                                    className="rounded-xl"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setLogoPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={() => setLogoPreview(null)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Hapus logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </FormCard>

                    {/* Favicon */}
                    <FormCard
                        title="Favicon"
                        description="Icon kecil yang muncul di tab browser (PNG, ICO — maks 512KB)"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                                {faviconPreview ? (
                                    <img src={faviconPreview} alt="Favicon" className="h-full w-full object-contain" />
                                ) : (
                                    <span className="text-xs text-gray-300">ICO</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="app_favicon"
                                    type="file"
                                    accept="image/png,image/x-icon"
                                    className="rounded-xl"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFaviconPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                {faviconPreview && (
                                    <button
                                        type="button"
                                        onClick={() => setFaviconPreview(null)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Hapus favicon
                                    </button>
                                )}
                            </div>
                        </div>
                    </FormCard>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl" style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            {processing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Simpan Branding</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}