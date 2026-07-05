<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_participant_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('training_participant_id');
            $table->string('invoice_number');
            $table->decimal('amount', 12, 2)->default(0);
            $table->enum('payment_method', ['cash', 'transfer', 'qris']);
            $table->unsignedBigInteger('payment_configuration_id')->nullable();
            $table->unsignedBigInteger('financial_transaction_id')->nullable();
            $table->timestamp('paid_at');
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->timestamps();

            $table->index(['training_participant_id']);
            $table->index(['invoice_number']);

            $table->foreign('training_participant_id')->references('id')->on('training_participants')->cascadeOnDelete();
            $table->foreign('payment_configuration_id')->references('id')->on('payment_configurations')->nullOnDelete();
            $table->foreign('financial_transaction_id')->references('id')->on('financial_transactions')->nullOnDelete();
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_participant_payments');
    }
};
