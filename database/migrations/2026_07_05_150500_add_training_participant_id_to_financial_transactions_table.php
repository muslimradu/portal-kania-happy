<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('training_participant_id')->nullable()->after('invoice_id');

            $table->foreign('training_participant_id')->references('id')->on('training_participants')->nullOnDelete();
            $table->index('training_participant_id');
        });
    }

    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropForeign(['training_participant_id']);
            $table->dropIndex(['training_participant_id']);
            $table->dropColumn('training_participant_id');
        });
    }
};
