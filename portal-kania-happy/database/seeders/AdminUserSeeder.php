<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@portalkaniah.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        $admin->assignRole('Admin');
    }
}
