<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('payment_configuration_id')->nullable();
            $table->enum('payment_method', ['cash', 'transfer', 'qris']);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('paid');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('payment_configuration_id')->references('id')->on('payment_configurations')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
