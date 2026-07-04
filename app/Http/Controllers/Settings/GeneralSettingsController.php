<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateGeneralSettingsRequest;
use App\Services\ActivityLogService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GeneralSettingsController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly SettingsService $settingsService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(): Response
    {
        $this->authorizePermission('settings.view');

        return Inertia::render('settings/General', [
            'generalSettings' => $this->settingsService->getByGroup('general')->mapWithKeys(
                fn ($setting) => [$setting->key => $setting->getTypedValue()]
            ),
        ]);
    }

    public function update(UpdateGeneralSettingsRequest $request): RedirectResponse
    {
        $this->settingsService->updateMany($request->validated());

        $this->activityLogService->log(
            module: 'settings',
            action: 'update',
            description: 'Memperbarui pengaturan umum aplikasi',
            properties: $request->validated(),
        );

        return back()->with('success', 'Pengaturan umum berhasil disimpan.');
    }
}
