<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $settingsService = app(SettingsService::class);

        return [
            ...parent::share($request),
            'name' => $settingsService->get('app_name', config('app.name')),
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id'    => $request->user()->id,
                        'name'  => $request->user()->name,
                        'email' => $request->user()->email,
                        'avatar' => $request->user()->avatar,
                        'email_verified_at' => $request->user()->email_verified_at,
                        'roles' => $request->user()->getRoleNames(),
                        'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    ]
                    : null,
            ],
            'settings' => $settingsService->getPublic(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
        ];
    }
}