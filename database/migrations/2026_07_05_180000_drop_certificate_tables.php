<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('generated_certificates');
        Schema::dropIfExists('certificate_templates');
    }

    public function down(): void
    {
        // Certificate feature removed intentionally.
    }
};
