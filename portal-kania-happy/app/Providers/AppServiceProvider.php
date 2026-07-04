<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\ActivityLogService;
use App\Services\SettingsService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SettingsService::class);
        $this->app->singleton(ActivityLogService::class);
        $this->app->singleton(\App\Services\GymClassService::class);
        $this->app->singleton(\App\Services\MembershipPackageService::class);
        $this->app->singleton(\App\Services\PaymentConfigurationService::class);
        $this->app->singleton(\App\Services\MemberService::class);
    }

    public function boot(): void
    {
        //
    }
}