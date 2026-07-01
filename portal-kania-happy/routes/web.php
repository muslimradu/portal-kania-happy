<?php

declare(strict_types=1);

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\GeneralSettingsController;
use App\Http\Controllers\Settings\BrandingSettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/general', [GeneralSettingsController::class, 'index'])->name('general');
        Route::patch('/general', [GeneralSettingsController::class, 'update'])->name('general.update');

        Route::get('/branding', [BrandingSettingsController::class, 'index'])->name('branding');
        Route::patch('/branding', [BrandingSettingsController::class, 'update'])->name('branding.update');
    });
});

require __DIR__.'/auth.php';