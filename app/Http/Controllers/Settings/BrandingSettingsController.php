<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingSettingsRequest;
use App\Services\ActivityLogService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingSettingsController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly SettingsService $settingsService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(): Response
    {
        $this->authorizePermission('settings.view');

        return Inertia::render('settings/Branding', [
            'brandingSettings' => $this->settingsService->getByGroup('branding')->mapWithKeys(
                fn ($setting) => [$setting->key => $setting->getTypedValue()]
            ),
        ]);
    }

    public function update(UpdateBrandingSettingsRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['app_logo', 'app_favicon']);

        if ($request->hasFile('app_logo')) {
            $oldLogo = $this->settingsService->get('app_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }
            $data['app_logo'] = $request->file('app_logo')->store('branding', 'public');
        }

        if ($request->hasFile('app_favicon')) {
            $oldFavicon = $this->settingsService->get('app_favicon');
            if ($oldFavicon) {
                Storage::disk('public')->delete($oldFavicon);
            }
            $data['app_favicon'] = $request->file('app_favicon')->store('branding', 'public');
        }

        $this->settingsService->updateMany($data);

        $this->activityLogService->log(
            module: 'settings',
            action: 'update',
            description: 'Memperbarui branding aplikasi',
            properties: array_keys($data),
        );

        return back()->with('success', 'Branding berhasil disimpan.');
    }
}
