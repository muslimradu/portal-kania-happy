<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'settings.view',
            'settings.update',
            'activity_logs.view',
            'gym_classes.view',
            'gym_classes.create',
            'gym_classes.update',
            'gym_classes.delete',
            'gym_classes.restore',
            'gym_classes.export',
            'membership_packages.view',
            'membership_packages.create',
            'membership_packages.update',
            'membership_packages.delete',
            'membership_packages.restore',
            'membership_packages.export',
            'payment_configurations.view',
            'payment_configurations.create',
            'payment_configurations.update',
            'payment_configurations.delete',
            'payment_configurations.restore',
            'members.view',
            'members.create',
            'members.update',
            'members.delete',
            'members.restore',
            'members.export',
            'memberships.view',
            'memberships.create',
            'memberships.update',
            'memberships.delete',
            'memberships.restore',
            'memberships.export',
            'invoices.view',
            'cashier.view',
            'cashier.checkin',
            'cashier.transaction',
            'attendances.view',
            'transactions.view',
            'studio_bookings.view',
            'studio_bookings.create',
            'studio_bookings.update',
            'studio_bookings.delete',
            'studio_bookings.restore',
            'studio_bookings.export',
            'studio_bookings.pay',
            'studio_bookings.cancel',
            'reports.gym_activity.view',
            'reports.gym_activity.export',
            'reports.membership.view',
            'reports.membership.export',
            'financial_reports.view',
            'financial_reports.export',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
