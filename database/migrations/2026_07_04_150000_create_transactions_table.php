<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('invoice_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->unsignedBigInteger('gym_class_id')->nullable();
            $table->string('class_name');
            $table->unsignedBigInteger('payment_configuration_id')->nullable();
            $table->enum('payment_method', ['cash', 'transfer', 'qris', 'pay_later'])->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->enum('status', ['paid', 'unpaid', 'cancelled'])->default('paid');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('gym_class_id')->references('id')->on('gym_classes')->nullOnDelete();
            $table->foreign('payment_configuration_id')->references('id')->on('payment_configurations')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
