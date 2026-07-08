<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_package_details', function (Blueprint $table) {
            $table->unsignedTinyInteger('quota_group')->nullable()->after('gym_class_id');
        });

        Schema::table('membership_details', function (Blueprint $table) {
            $table->unsignedTinyInteger('quota_group')->nullable()->after('gym_class_id');
        });
    }

    public function down(): void
    {
        Schema::table('membership_package_details', function (Blueprint $table) {
            $table->dropColumn('quota_group');
        });

        Schema::table('membership_details', function (Blueprint $table) {
            $table->dropColumn('quota_group');
        });
    }
};
