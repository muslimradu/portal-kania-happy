<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->index(['type', 'transaction_date'], 'ft_type_date_index');
            $table->index('payment_method', 'ft_payment_method_index');
            $table->index('transaction_id', 'ft_transaction_id_index');
            $table->index('studio_booking_id', 'ft_studio_booking_id_index');
            $table->index('invoice_id', 'ft_invoice_id_index');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'transactions_status_created_index');
            $table->index(['gym_class_id', 'created_at'], 'transactions_class_created_index');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index('checked_in_at', 'attendances_checked_in_index');
            $table->index(['gym_class_id', 'checked_in_at'], 'attendances_class_checked_in_index');
        });

        Schema::table('memberships', function (Blueprint $table) {
            $table->index('end_date', 'memberships_end_date_index');
            $table->index(['status', 'end_date'], 'memberships_status_end_date_index');
            $table->index('start_date', 'memberships_start_date_index');
            $table->index('membership_package_id', 'memberships_package_id_index');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->index('is_active', 'members_is_active_index');
            $table->index('created_at', 'members_created_at_index');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index('created_at', 'activity_logs_created_at_index');
            $table->index(['module', 'created_at'], 'activity_logs_module_created_index');
        });

        Schema::table('studio_bookings', function (Blueprint $table) {
            $table->index('booking_date', 'studio_bookings_booking_date_index');
        });
    }

    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropIndex('ft_type_date_index');
            $table->dropIndex('ft_payment_method_index');
            $table->dropIndex('ft_transaction_id_index');
            $table->dropIndex('ft_studio_booking_id_index');
            $table->dropIndex('ft_invoice_id_index');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_status_created_index');
            $table->dropIndex('transactions_class_created_index');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('attendances_checked_in_index');
            $table->dropIndex('attendances_class_checked_in_index');
        });

        Schema::table('memberships', function (Blueprint $table) {
            $table->dropIndex('memberships_end_date_index');
            $table->dropIndex('memberships_status_end_date_index');
            $table->dropIndex('memberships_start_date_index');
            $table->dropIndex('memberships_package_id_index');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex('members_is_active_index');
            $table->dropIndex('members_created_at_index');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('activity_logs_created_at_index');
            $table->dropIndex('activity_logs_module_created_index');
        });

        Schema::table('studio_bookings', function (Blueprint $table) {
            $table->dropIndex('studio_bookings_booking_date_index');
        });
    }
};
