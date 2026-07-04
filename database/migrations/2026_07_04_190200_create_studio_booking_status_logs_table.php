<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_booking_status_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('studio_booking_id');
            $table->enum('field', ['status', 'payment_status']);
            $table->string('from_value')->nullable();
            $table->string('to_value');
            $table->string('note')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->foreign('studio_booking_id')->references('id')->on('studio_bookings')->cascadeOnDelete();
            $table->foreign('changed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studio_booking_status_logs');
    }
};
