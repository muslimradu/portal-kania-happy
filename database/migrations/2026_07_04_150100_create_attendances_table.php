<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('gym_class_id')->nullable();
            $table->string('class_name');
            $table->unsignedBigInteger('membership_id')->nullable();
            $table->unsignedBigInteger('membership_detail_id')->nullable();
            $table->string('package_name')->nullable();
            $table->unsignedInteger('quota_before')->nullable();
            $table->unsignedInteger('quota_after')->nullable();
            $table->boolean('is_unlimited')->default(false);
            $table->timestamp('checked_in_at');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('gym_class_id')->references('id')->on('gym_classes')->nullOnDelete();
            $table->foreign('membership_id')->references('id')->on('memberships')->nullOnDelete();
            $table->foreign('membership_detail_id')->references('id')->on('membership_details')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->index(['member_id', 'checked_in_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
