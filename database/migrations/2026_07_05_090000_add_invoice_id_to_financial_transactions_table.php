<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('invoice_id')->nullable()->after('studio_booking_id');

            $table->foreign('invoice_id')->references('id')->on('invoices')->nullOnDelete();
            $table->index('category');
        });

        $this->backfillMembershipRevenue();
    }

    /**
     * Historic paid invoices predate the financial_transactions integration for
     * membership registrations - backfill them so Financial Report reflects all
     * real income sources from day one.
     */
    private function backfillMembershipRevenue(): void
    {
        $invoices = DB::table('invoices')
            ->where('status', 'paid')
            ->whereNotIn('id', function ($query) {
                $query->select('invoice_id')->from('financial_transactions')->whereNotNull('invoice_id');
            })
            ->get();

        foreach ($invoices as $invoice) {
            DB::table('financial_transactions')->insert([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'invoice_id' => $invoice->id,
                'type' => 'income',
                'category' => 'membership',
                'amount' => $invoice->total_amount,
                'payment_method' => $invoice->payment_method,
                'description' => "Pendaftaran member - Invoice {$invoice->invoice_number}",
                'transaction_date' => $invoice->created_at ? date('Y-m-d', strtotime((string) $invoice->created_at)) : now()->toDateString(),
                'created_by' => $invoice->created_by,
                'created_at' => $invoice->created_at,
                'updated_at' => $invoice->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropIndex(['category']);
            $table->dropColumn('invoice_id');
        });
    }
};
