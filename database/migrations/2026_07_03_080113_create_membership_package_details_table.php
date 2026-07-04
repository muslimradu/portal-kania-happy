<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_package_details', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('membership_package_id');
            $table->unsignedBigInteger('gym_class_id')->nullable();
            $table->unsignedInteger('quota')->nullable();
            $table->boolean('is_unlimited')->default(false);
            $table->timestamps();

            $table->foreign('membership_package_id')
                ->references('id')->on('membership_packages')->cascadeOnDelete();
            $table->foreign('gym_class_id')
                ->references('id')->on('gym_classes')->nullOnDelete();

            $table->unique(['membership_package_id', 'gym_class_id'], 'mpd_package_class_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_package_details');
    }
};
