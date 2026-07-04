<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\StudioBooking;
use App\Models\StudioBookingPayment;
use App\Models\StudioBookingStatusLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class StudioBookingService
{
    public function __construct(
        private readonly MemberService $memberService,
        private readonly InvoiceService $invoiceService,
        private readonly SettingsService $settingsService,
    ) {}

    public function pricePerHour(): float
    {
        return (float) $this->settingsService->get('booking_price_per_hour', 150000);
    }

    /**
     * @return array{start: string, end: string}
     */
    public function operatingHours(): array
    {
        return [
            'start' => (string) $this->settingsService->get('booking_operating_start', '08:00'),
            'end' => (string) $this->settingsService->get('booking_operating_end', '20:00'),
        ];
    }

    public function calculateDuration(string $start, string $end): int
    {
        return (int) Carbon::parse($start)->diffInMinutes(Carbon::parse($end));
    }

    public function calculatePrice(int $durationMinutes): float
    {
        return round(($durationMinutes / 60) * $this->pricePerHour(), 2);
    }

    public function hasConflict(string $date, string $start, string $end, ?int $excludeId = null): bool
    {
        return StudioBooking::query()
            ->where('booking_date', $date)
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->when($excludeId, fn (Builder $q) => $q->where('id', '!=', $excludeId))
            ->exists();
    }

    /**
     * Recompute upcoming -> ongoing -> completed transitions based on current time.
     * Cancelled bookings are never touched. Runs cheaply via bulk query updates.
     */
    public function syncStatuses(): void
    {
        $today = Carbon::today()->toDateString();
        $now = Carbon::now()->format('H:i:s');

        DB::table('studio_bookings')
            ->whereNull('deleted_at')
            ->where('status', 'upcoming')
            ->where('booking_date', $today)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->update(['status' => 'ongoing', 'updated_at' => now()]);

        DB::table('studio_bookings')
            ->whereNull('deleted_at')
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->where(function ($q) use ($today, $now) {
                $q->where('booking_date', '<', $today)
                    ->orWhere(function ($q2) use ($today, $now) {
                        $q2->where('booking_date', $today)->where('end_time', '<=', $now);
                    });
            })
            ->update(['status' => 'completed', 'updated_at' => now()]);
    }

    public function paginate(
        ?string $search = null,
        ?string $status = null,
        ?string $paymentStatus = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        string $sortBy = 'booking_date',
        string $sortDir = 'desc',
        int $perPage = 10,
    ): LengthAwarePaginator {
        $this->syncStatuses();

        return StudioBooking::withTrashed()
            ->with('paymentConfiguration')
            ->search($search)
            ->when($status === 'trashed', fn (Builder $q) => $q->whereNotNull('deleted_at'))
            ->when($status && $status !== 'trashed', fn (Builder $q) => $q->whereNull('deleted_at')->where('status', $status))
            ->when(! $status, fn (Builder $q) => $q->whereNull('deleted_at'))
            ->when($paymentStatus, fn (Builder $q) => $q->where('payment_status', $paymentStatus))
            ->when($dateFrom, fn (Builder $q) => $q->where('booking_date', '>=', $dateFrom))
            ->when($dateTo, fn (Builder $q) => $q->where('booking_date', '<=', $dateTo))
            ->orderBy($sortBy, $sortDir)
            ->orderBy('start_time', $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return Collection<int, StudioBooking>
     */
    public function forRange(string $dateFrom, string $dateTo): Collection
    {
        $this->syncStatuses();

        return StudioBooking::query()
            ->whereBetween('booking_date', [$dateFrom, $dateTo])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * @return array<int, array{start: string, end: string, status: string}>
     */
    public function todayAvailability(): array
    {
        $this->syncStatuses();

        [$opStart, $opEnd] = [$this->operatingHours()['start'], $this->operatingHours()['end']];

        $cursor = Carbon::parse($opStart);
        $end = Carbon::parse($opEnd);

        $bookings = StudioBooking::query()
            ->where('booking_date', Carbon::today()->toDateString())
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '<', $opEnd)
            ->where('end_time', '>', $opStart)
            ->orderBy('start_time')
            ->get(['start_time', 'end_time', 'payment_status', 'status']);

        $segments = [];

        foreach ($bookings as $booking) {
            $bookingStart = Carbon::parse($booking->start_time);
            $bookingEnd = Carbon::parse($booking->end_time);

            if ($bookingStart->lt($cursor)) {
                $bookingStart = $cursor->copy();
            }
            if ($bookingEnd->gt($end)) {
                $bookingEnd = $end->copy();
            }

            if ($bookingStart->gt($cursor)) {
                $segments[] = [
                    'start' => $cursor->format('H:i'),
                    'end' => $bookingStart->format('H:i'),
                    'status' => 'available',
                ];
            }

            $segments[] = [
                'start' => $bookingStart->format('H:i'),
                'end' => $bookingEnd->format('H:i'),
                'status' => $booking->payment_status === 'unpaid' ? 'unpaid' : 'booked',
            ];

            $cursor = $bookingEnd->gt($cursor) ? $bookingEnd->copy() : $cursor;
        }

        if ($cursor->lt($end)) {
            $segments[] = [
                'start' => $cursor->format('H:i'),
                'end' => $end->format('H:i'),
                'status' => 'available',
            ];
        }

        return $segments;
    }

    public function findByUuid(string $uuid): StudioBooking
    {
        return StudioBooking::withTrashed()->where('uuid', $uuid)->firstOrFail();
    }

    public function create(array $data): StudioBooking
    {
        return DB::transaction(function () use ($data) {
            $duration = $this->calculateDuration($data['start_time'], $data['end_time']);
            $price = $this->calculatePrice($duration);

            if ($this->hasConflict($data['booking_date'], $data['start_time'], $data['end_time'])) {
                throw new RuntimeException('Jadwal ini sudah dibooking.');
            }

            $booking = StudioBooking::create([
                'customer_name' => $data['customer_name'],
                'customer_phone' => $this->memberService->normalizePhone($data['customer_phone']),
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'duration_minutes' => $duration,
                'price' => $price,
                'notes' => $data['notes'] ?? null,
                'status' => 'upcoming',
                'payment_status' => 'unpaid',
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            if (! empty($data['pay_now'])) {
                $this->processPayment($booking, $data);
            }

            return $booking->fresh();
        });
    }

    public function update(StudioBooking $booking, array $data): StudioBooking
    {
        return DB::transaction(function () use ($booking, $data) {
            $duration = $this->calculateDuration($data['start_time'], $data['end_time']);
            $price = $this->calculatePrice($duration);

            if ($this->hasConflict($data['booking_date'], $data['start_time'], $data['end_time'], $booking->id)) {
                throw new RuntimeException('Jadwal ini sudah dibooking.');
            }

            $booking->update([
                'customer_name' => $data['customer_name'],
                'customer_phone' => $this->memberService->normalizePhone($data['customer_phone']),
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'duration_minutes' => $duration,
                'price' => $price,
                'notes' => $data['notes'] ?? null,
                'updated_by' => auth()->id(),
            ]);

            return $booking->fresh();
        });
    }

    public function delete(StudioBooking $booking): void
    {
        DB::transaction(fn () => $booking->delete());
    }

    public function restore(string $uuid): StudioBooking
    {
        $booking = StudioBooking::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $booking->restore());

        return $booking;
    }

    public function cancel(StudioBooking $booking, ?string $reason = null): StudioBooking
    {
        return DB::transaction(function () use ($booking, $reason) {
            $previousStatus = $booking->status;

            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancel_reason' => $reason,
                'updated_by' => auth()->id(),
            ]);

            $this->logStatusChange($booking, 'status', $previousStatus, 'cancelled', $reason);

            return $booking->fresh();
        });
    }

    public function processPayment(StudioBooking $booking, array $data): StudioBooking
    {
        return DB::transaction(function () use ($booking, $data) {
            if ($booking->payment_status === 'paid') {
                throw new RuntimeException('Booking ini sudah dibayar.');
            }

            $invoiceNumber = $booking->invoice_number ?? $this->invoiceService->generateInvoiceNumber();

            $financialTransaction = FinancialTransaction::create([
                'studio_booking_id' => $booking->id,
                'type' => 'income',
                'category' => 'studio_booking',
                'amount' => $booking->price,
                'payment_method' => $data['payment_method'],
                'description' => "Booking sanggar: {$booking->customer_name} ({$booking->booking_date->format('d-m-Y')} {$booking->start_time}-{$booking->end_time})",
                'transaction_date' => now()->toDateString(),
                'created_by' => auth()->id(),
            ]);

            StudioBookingPayment::create([
                'studio_booking_id' => $booking->id,
                'invoice_number' => $invoiceNumber,
                'amount' => $booking->price,
                'payment_method' => $data['payment_method'],
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'financial_transaction_id' => $financialTransaction->id,
                'paid_at' => now(),
                'recorded_by' => auth()->id(),
            ]);

            $previousPaymentStatus = $booking->payment_status;

            $booking->update([
                'payment_status' => 'paid',
                'payment_method' => $data['payment_method'],
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'invoice_number' => $invoiceNumber,
                'paid_at' => now(),
                'updated_by' => auth()->id(),
            ]);

            $this->logStatusChange($booking, 'payment_status', $previousPaymentStatus, 'paid');

            return $booking->fresh();
        });
    }

    private function logStatusChange(StudioBooking $booking, string $field, ?string $from, string $to, ?string $note = null): StudioBookingStatusLog
    {
        return StudioBookingStatusLog::create([
            'studio_booking_id' => $booking->id,
            'field' => $field,
            'from_value' => $from,
            'to_value' => $to,
            'note' => $note,
            'changed_by' => auth()->id(),
        ]);
    }
}
