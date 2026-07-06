<?php

declare(strict_types=1);

namespace Tests\Feature\Member;

use App\Models\GymClass;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPackage;
use App\Models\MembershipPackageDetail;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');

        return $user;
    }

    private function createPackage(): MembershipPackage
    {
        $gymClass = GymClass::create([
            'name' => 'Aerobic',
            'price' => 25000,
            'color_label' => '#7C3AED',
            'icon' => 'Dumbbell',
            'is_active' => true,
        ]);

        $package = MembershipPackage::create([
            'name' => 'Paket 1 Bulan',
            'price' => 300000,
            'expired_type' => 'months',
            'expired_duration' => 1,
            'is_active' => true,
        ]);

        MembershipPackageDetail::create([
            'membership_package_id' => $package->id,
            'gym_class_id' => $gymClass->id,
            'quota' => 12,
            'is_unlimited' => false,
        ]);

        return $package;
    }

    public function test_can_register_new_member_with_package(): void
    {
        $package = $this->createPackage();
        $admin = $this->admin();

        $response = $this->actingAs($admin)->post(route('members.register'), [
            'member' => [
                'name' => 'Budi Santoso',
                'phone' => '6281234567890',
            ],
            'package_ids' => [$package->id],
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSame(1, Member::count());
        $membership = Membership::first();
        $this->assertNotNull($membership);
        $this->assertNull($membership->start_date);
        $this->assertNull($membership->end_date);
    }

    public function test_can_add_package_to_existing_member(): void
    {
        $package = $this->createPackage();
        $admin = $this->admin();

        $existing = Member::create([
            'name' => 'Siti Aminah',
            'phone' => '6289876543210',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post(route('members.register'), [
            'member_uuid' => $existing->uuid,
            'member' => [
                'name' => 'Siti Aminah',
                'phone' => '6289876543210',
            ],
            'package_ids' => [$package->id],
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSame(1, Member::count());
        $this->assertSame(1, Membership::where('member_id', $existing->id)->count());
    }
}
