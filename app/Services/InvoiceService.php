<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function generateInvoiceNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $today = "INV-{$date}-";

        return DB::transaction(function () use ($today) {
            $lastFromInvoices = DB::table('invoices')
                ->where('invoice_number', 'like', "{$today}%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $lastFromTransactions = DB::table('transactions')
                ->where('invoice_number', 'like', "{$today}%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $lastFromBookings = DB::table('studio_bookings')
                ->where('invoice_number', 'like', "{$today}%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $sequence = 1;
            $lastNumbers = array_filter([$lastFromInvoices, $lastFromTransactions, $lastFromBookings]);

            if (! empty($lastNumbers)) {
                $sequence = max(array_map(fn ($number) => (int) substr($number, -4), $lastNumbers)) + 1;
            }

            return $today.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
        });
    }

    public function generateTrainingInvoiceNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $today = "TRN-{$date}-";

        return DB::transaction(function () use ($today) {
            $last = DB::table('training_participants')
                ->where('invoice_number', 'like', "{$today}%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $sequence = 1;

            if ($last) {
                $sequence = (int) substr($last, -4) + 1;
            }

            return $today.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
        });
    }
}
