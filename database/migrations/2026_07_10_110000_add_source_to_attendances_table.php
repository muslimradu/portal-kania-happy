<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('attendances', 'source')) {
            return;
        }

        Schema::table('attendances', function (Blueprint $table) {
            $table->string('source', 20)->default('checkin')->after('is_unlimited');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('attendances', 'source')) {
            return;
        }

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
