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
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
