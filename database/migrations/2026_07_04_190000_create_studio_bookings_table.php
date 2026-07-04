<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->decimal('price', 12, 2)->default(0);
            $table->text('notes')->nullable();

            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
            $table->enum('payment_method', ['cash', 'transfer', 'qris'])->nullable();
            $table->unsignedBigInteger('payment_configuration_id')->nullable();
            $table->string('invoice_number')->nullable()->unique();
            $table->timestamp('paid_at')->nullable();

            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancel_reason')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['booking_date', 'start_time', 'end_time']);
            $table->index(['status']);
            $table->index(['payment_status']);

            $table->foreign('payment_configuration_id')->references('id')->on('payment_configurations')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studio_bookings');
    }
};
