<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_details', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('membership_id');
            $table->unsignedBigInteger('gym_class_id')->nullable();
            $table->string('class_name');
            $table->unsignedInteger('quota')->nullable();
            $table->unsignedInteger('quota_used')->default(0);
            $table->boolean('is_unlimited')->default(false);
            $table->timestamps();

            $table->foreign('membership_id')->references('id')->on('memberships')->cascadeOnDelete();
            $table->foreign('gym_class_id')->references('id')->on('gym_classes')->nullOnDelete();

            $table->unique(['membership_id', 'gym_class_id'], 'md_membership_class_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_details');
    }
};
