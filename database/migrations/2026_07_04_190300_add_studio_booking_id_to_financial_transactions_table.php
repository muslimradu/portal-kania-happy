<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('studio_booking_id')->nullable()->after('transaction_id');

            $table->foreign('studio_booking_id')->references('id')->on('studio_bookings')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropForeign(['studio_booking_id']);
            $table->dropColumn('studio_booking_id');
        });
    }
};
