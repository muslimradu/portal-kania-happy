<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainings', function (Blueprint $table) {
            $table->date('first_training_date')->nullable()->after('training_dates');
            $table->date('last_training_date')->nullable()->after('first_training_date');
        });

        DB::table('trainings')->orderBy('id')->lazy()->each(function ($training) {
            $dates = json_decode((string) $training->training_dates, true) ?? [];

            if ($dates === []) {
                return;
            }

            sort($dates);

            DB::table('trainings')->where('id', $training->id)->update([
                'first_training_date' => $dates[0],
                'last_training_date' => $dates[array_key_last($dates)],
            ]);
        });

        Schema::table('trainings', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
            $table->index(['first_training_date', 'last_training_date']);
        });
    }

    public function down(): void
    {
        Schema::table('trainings', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft')->after('price');
            $table->dropIndex(['first_training_date', 'last_training_date']);
            $table->dropColumn(['first_training_date', 'last_training_date']);
            $table->index(['status']);
        });
    }
};
