<?php

declare(strict_types=1);

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelStudioBookingRequest;
use App\Http\Requests\Booking\ProcessBookingPaymentRequest;
use App\Http\Requests\Booking\StoreStudioBookingRequest;
use App\Http\Requests\Booking\UpdateBookingSettingsRequest;
use App\Http\Requests\Booking\UpdateStudioBookingRequest;
use App\Models\PaymentConfiguration;
use App\Models\StudioBooking;
use App\Services\ActivityLogService;
use App\Services\ExportService;
use App\Services\SettingsService;
use App\Services\StudioBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudioBookingController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly StudioBookingService $bookingService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizePermission('studio_bookings.view');

        $bookings = $this->bookingService->paginate(
            search: $request->string('search')->toString() ?: null,
            status: $request->string('status')->toString() ?: null,
            paymentStatus: $request->string('payment_status')->toString() ?: null,
            dateFrom: $request->string('date_from')->toString() ?: null,
            dateTo: $request->string('date_to')->toString() ?: null,
            sortBy: $request->string('sort_by', 'booking_date')->toString(),
            sortDir: $request->string('sort_dir', 'desc')->toString(),
            perPage: $request->integer('per_page', 10),
        );

        return Inertia::render('bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status', 'payment_status', 'date_from', 'date_to', 'sort_by', 'sort_dir', 'per_page']),
            'paymentConfigurations' => PaymentConfiguration::active()->orderBy('name')->get(),
            'bookingSettings' => [
                'price_per_hour' => $this->bookingService->pricePerHour(),
                'operating_hours' => $this->bookingService->operatingHours(),
            ],
        ]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $this->authorizePermission('studio_bookings.view');

        $dateFrom = $request->string('date_from')->toString() ?: Carbon::today()->toDateString();
        $dateTo = $request->string('date_to')->toString() ?: Carbon::today()->toDateString();

        return response()->json([
            'data' => $this->bookingService->forRange($dateFrom, $dateTo),
            'today_availability' => $this->bookingService->todayAvailability(),
        ]);
    }

    public function store(StoreStudioBookingRequest $request): RedirectResponse
    {
        try {
            $booking = $this->bookingService->create($request->validated());
        } catch (RuntimeException $e) {
            return back()->withErrors(['schedule' => $e->getMessage()]);
        }

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'create',
            description: "Membuat booking sanggar: {$booking->customer_name} ({$booking->booking_date->format('d-m-Y')} {$booking->start_time}-{$booking->end_time})",
            properties: $booking->toArray(),
        );

        if ($booking->payment_status === 'paid') {
            $this->activityLogService->log(
                module: 'studio_bookings',
                action: 'payment',
                description: "Pembayaran booking {$booking->customer_name} (Invoice {$booking->invoice_number})",
                properties: [
                    'invoice_number' => $booking->invoice_number,
                    'amount' => (string) $booking->price,
                    'payment_method' => $booking->payment_method,
                ],
            );
        }

        return back()->with('success', "Booking untuk {$booking->customer_name} berhasil dibuat.");
    }

    public function update(UpdateStudioBookingRequest $request, StudioBooking $studio_booking): RedirectResponse
    {
        try {
            $booking = $this->bookingService->update($studio_booking, $request->validated());
        } catch (RuntimeException $e) {
            return back()->withErrors(['schedule' => $e->getMessage()]);
        }

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'update',
            description: "Mengubah booking sanggar: {$booking->customer_name}",
            properties: $booking->toArray(),
        );

        return back()->with('success', "Booking {$booking->customer_name} berhasil diperbarui.");
    }

    public function destroy(StudioBooking $studio_booking): RedirectResponse
    {
        $name = $studio_booking->customer_name;
        $this->bookingService->delete($studio_booking);

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'delete',
            description: "Menghapus booking sanggar: {$name}",
        );

        return back()->with('success', "Booking {$name} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $booking = $this->bookingService->restore($uuid);

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'restore',
            description: "Memulihkan booking sanggar: {$booking->customer_name}",
        );

        return back()->with('success', "Booking {$booking->customer_name} berhasil dipulihkan.");
    }

    public function pay(ProcessBookingPaymentRequest $request, StudioBooking $studio_booking): RedirectResponse
    {
        try {
            $booking = $this->bookingService->processPayment($studio_booking, $request->validated());
        } catch (RuntimeException $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'payment',
            description: "Pembayaran booking {$booking->customer_name} (Invoice {$booking->invoice_number})",
            properties: [
                'invoice_number' => $booking->invoice_number,
                'amount' => (string) $booking->price,
                'payment_method' => $booking->payment_method,
            ],
        );

        return back()->with('success', "Pembayaran booking {$booking->customer_name} berhasil. Invoice: {$booking->invoice_number}");
    }

    public function cancel(CancelStudioBookingRequest $request, StudioBooking $studio_booking): RedirectResponse
    {
        $booking = $this->bookingService->cancel($studio_booking, $request->validated('reason'));

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'cancellation',
            description: "Membatalkan booking sanggar: {$booking->customer_name}" . ($request->validated('reason') ? " ({$request->validated('reason')})" : ''),
        );

        return back()->with('success', "Booking {$booking->customer_name} berhasil dibatalkan.");
    }

    public function export(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('studio_bookings.export'), 403);

        $this->activityLogService->log('studio_bookings', 'export', 'Mengekspor data booking sanggar', $request);

        return app(ExportService::class)->exportBookings();
    }

    public function updateSettings(UpdateBookingSettingsRequest $request, SettingsService $settingsService): RedirectResponse
    {
        $settingsService->updateMany($request->validated());

        $this->activityLogService->log(
            module: 'studio_bookings',
            action: 'update_settings',
            description: 'Memperbarui pengaturan harga & jam operasional booking sanggar',
            properties: $request->validated(),
        );

        return back()->with('success', 'Pengaturan booking sanggar berhasil disimpan.');
    }
}
