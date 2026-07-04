<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->enum('type', ['income', 'expense'])->default('income');
            $table->string('category')->default('pos_sale');
            $table->decimal('amount', 12, 2)->default(0);
            $table->enum('payment_method', ['cash', 'transfer', 'qris'])->nullable();
            $table->string('description')->nullable();
            $table->date('transaction_date');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('transaction_id')->references('id')->on('transactions')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
