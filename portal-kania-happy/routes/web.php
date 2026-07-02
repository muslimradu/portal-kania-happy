<?php

declare(strict_types=1);

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\GeneralSettingsController;
use App\Http\Controllers\Settings\BrandingSettingsController;
use App\Http\Controllers\GymClass\GymClassController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
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

    // Gym Classes
    Route::prefix('gym-classes')->name('gym-classes.')->group(function () {
        Route::get('/', [GymClassController::class, 'index'])->name('index');
        Route::post('/', [GymClassController::class, 'store'])->name('store');
        Route::patch('/{gym_class}', [GymClassController::class, 'update'])->name('update');
        Route::delete('/{gym_class}', [GymClassController::class, 'destroy'])->name('destroy');
        Route::patch('/{uuid}/restore', [GymClassController::class, 'restore'])->name('restore');
});
    });
});

require __DIR__.'/auth.php';