<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generated_certificates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('training_participant_id');
            $table->unsignedBigInteger('certificate_template_id')->nullable();
            $table->string('certificate_number')->unique();
            $table->string('verification_url');
            $table->string('png_path');
            $table->string('pdf_path');
            $table->json('generated_data');
            $table->timestamp('generated_at');
            $table->unsignedBigInteger('generated_by')->nullable();
            $table->boolean('is_latest')->default(true);
            $table->timestamps();

            $table->index(['training_participant_id']);
            $table->index(['certificate_number']);
            $table->index(['is_latest']);

            $table->foreign('training_participant_id')->references('id')->on('training_participants')->cascadeOnDelete();
            $table->foreign('certificate_template_id')->references('id')->on('certificate_templates')->nullOnDelete();
            $table->foreign('generated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_certificates');
    }
};
