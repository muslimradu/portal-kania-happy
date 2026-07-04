<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\ActivityLogService;
use App\Services\SettingsService;
use Illuminate\Support\Facades\URL;
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
        $this->app->singleton(\App\Services\InvoiceService::class);
        $this->app->singleton(\App\Services\MemberRegistrationService::class);
        $this->app->singleton(\App\Services\ExportService::class);
        $this->app->singleton(\App\Services\MembershipService::class);
        $this->app->singleton(\App\Services\CashierService::class);
        $this->app->singleton(\App\Services\StudioBookingService::class);
    }

    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}