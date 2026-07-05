<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_participants', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('training_id');
            $table->string('full_name');
            $table->string('phone');
            $table->enum('payment_status', ['unpaid', 'paid', 'pay_later'])->default('unpaid');
            $table->enum('payment_method', ['cash', 'transfer', 'qris', 'pay_later'])->nullable();
            $table->unsignedBigInteger('payment_configuration_id')->nullable();
            $table->string('invoice_number')->nullable()->unique();
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['training_id']);
            $table->index(['payment_status']);
            $table->index(['phone']);
            $table->index(['full_name']);

            $table->foreign('training_id')->references('id')->on('trainings')->cascadeOnDelete();
            $table->foreign('payment_configuration_id')->references('id')->on('payment_configurations')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_participants');
    }
};
