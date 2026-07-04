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
use App\Http\Controllers\Member\MemberController;
use App\Http\Controllers\Member\MemberRegistrationController;
use App\Http\Controllers\Membership\MembershipController;
use App\Http\Controllers\Cashier\CashierController;
use App\Http\Controllers\Booking\StudioBookingController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\FinancialReport\FinancialReportController;

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

// Members
Route::prefix('members')->name('members.')->group(function () {
    Route::get('/', [MemberController::class, 'index'])->name('index');
    Route::get('/export', [MemberController::class, 'export'])->name('export');
    Route::get('/memberships/export', [MemberController::class, 'exportMemberships'])->name('memberships.export');
    Route::post('/', [MemberController::class, 'store'])->name('store');
    Route::post('/register', [MemberRegistrationController::class, 'store'])->name('register');
    Route::get('/{member}', [MemberController::class, 'show'])->name('show');
    Route::patch('/{member}', [MemberController::class, 'update'])->name('update');
    Route::delete('/{member}', [MemberController::class, 'destroy'])->name('destroy');
    Route::patch('/{uuid}/restore', [MemberController::class, 'restore'])->name('restore');
});

// Memberships
Route::prefix('memberships')->name('memberships.')->group(function () {
    Route::patch('/{membership}/quota', [MembershipController::class, 'updateQuota'])->name('update-quota');
});

// Cashier
Route::prefix('cashier')->name('cashier.')->group(function () {
    Route::get('/', [CashierController::class, 'index'])->name('index');
    Route::get('/members/search', [CashierController::class, 'searchMembers'])->name('members.search');
    Route::post('/eligibility', [CashierController::class, 'eligibility'])->name('eligibility');
    Route::post('/check-in', [CashierController::class, 'checkIn'])->name('check-in');
    Route::post('/transactions', [CashierController::class, 'store'])->name('transactions.store');
});

// Studio Bookings
Route::prefix('bookings')->name('bookings.')->group(function () {
    Route::get('/', [StudioBookingController::class, 'index'])->name('index');
    Route::get('/calendar', [StudioBookingController::class, 'calendar'])->name('calendar');
    Route::get('/export', [StudioBookingController::class, 'export'])->name('export');
    Route::patch('/settings', [StudioBookingController::class, 'updateSettings'])->name('settings.update');
    Route::post('/', [StudioBookingController::class, 'store'])->name('store');
    Route::patch('/{studio_booking:uuid}', [StudioBookingController::class, 'update'])->name('update');
    Route::delete('/{studio_booking:uuid}', [StudioBookingController::class, 'destroy'])->name('destroy');
    Route::patch('/{uuid}/restore', [StudioBookingController::class, 'restore'])->name('restore');
    Route::post('/{studio_booking:uuid}/pay', [StudioBookingController::class, 'pay'])->name('pay');
    Route::post('/{studio_booking:uuid}/cancel', [StudioBookingController::class, 'cancel'])->name('cancel');
});

// Reports
Route::prefix('reports')->name('reports.')->group(function () {
    Route::get('/', [ReportController::class, 'index'])->name('index');
    Route::get('/gym-activity', [ReportController::class, 'gymActivity'])->name('gym-activity.index');
    Route::get('/membership', [ReportController::class, 'membership'])->name('membership.index');
    Route::get('/gym-activity/export', [ReportController::class, 'exportGymActivity'])->name('gym-activity.export');
    Route::get('/membership/export', [ReportController::class, 'exportMembership'])->name('membership.export');
});

// Financial Report
Route::prefix('financial-reports')->name('financial-reports.')->group(function () {
    Route::get('/', [FinancialReportController::class, 'index'])->name('index');
    Route::get('/export', [FinancialReportController::class, 'export'])->name('export');
});
});

require __DIR__.'/auth.php';