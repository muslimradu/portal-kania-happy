<?php

declare(strict_types=1);

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\GeneralSettingsController;
use App\Http\Controllers\Settings\BrandingSettingsController;
use App\Http\Controllers\GymClass\GymClassController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MembershipPackage\MembershipPackageController;
use App\Http\Controllers\PaymentConfiguration\PaymentConfigurationController;

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
    });

    // Gym Classes
    Route::prefix('gym-classes')->name('gym-classes.')->group(function () {
        Route::get('/', [GymClassController::class, 'index'])->name('index');
        Route::post('/', [GymClassController::class, 'store'])->name('store');
        Route::patch('/{gym_class:uuid}', [GymClassController::class, 'update'])->name('update');
        Route::delete('/{gym_class:uuid}', [GymClassController::class, 'destroy'])->name('destroy');
        Route::patch('/{uuid}/restore', [GymClassController::class, 'restore'])->name('restore');
    });

    // Membership Packages
Route::prefix('membership-packages')->name('membership-packages.')->group(function () {
    Route::get('/', [MembershipPackageController::class, 'index'])->name('index');
    Route::post('/', [MembershipPackageController::class, 'store'])->name('store');
    Route::patch('/{membershipPackage}', [MembershipPackageController::class, 'update'])->name('update');
    Route::delete('/{membershipPackage}', [MembershipPackageController::class, 'destroy'])->name('destroy');
    Route::patch('/{uuid}/restore', [MembershipPackageController::class, 'restore'])->name('restore');
});

// Payment Configuration
Route::prefix('settings/payment')->name('payment-configurations.')->group(function () {
    Route::get('/', [PaymentConfigurationController::class, 'index'])->name('index');
    Route::post('/qris', [PaymentConfigurationController::class, 'storeQris'])->name('qris.store');
    Route::post('/qris/{paymentConfiguration}', [PaymentConfigurationController::class, 'updateQris'])->name('qris.update');
    Route::post('/transfer', [PaymentConfigurationController::class, 'storeTransfer'])->name('transfer.store');
    Route::post('/transfer/{paymentConfiguration}', [PaymentConfigurationController::class, 'updateTransfer'])->name('transfer.update');
    Route::delete('/{paymentConfiguration}', [PaymentConfigurationController::class, 'destroy'])->name('destroy');
    Route::patch('/{uuid}/restore', [PaymentConfigurationController::class, 'restore'])->name('restore');
    Route::patch('/qris/{paymentConfiguration}/activate', [PaymentConfigurationController::class, 'activateQris'])->name('qris.activate');
});
});

require __DIR__.'/auth.php';