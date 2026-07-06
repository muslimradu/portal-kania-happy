<?php

declare(strict_types=1);

namespace Tests\Feature\Membership;

use App\Models\GymClass;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPackage;
use App\Models\MembershipPackageDetail;
use App\Models\User;
use App\Services\CashierService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MembershipActivationOnCheckInTest extends TestCase
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

    private function createPackageWithClass(): array
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

        return [$package, $gymClass];
    }

    public function test_membership_registration_does_not_set_dates_until_first_check_in(): void
    {
        Carbon::setTestNow('2026-07-05 10:00:00');
        [$package] = $this->createPackageWithClass();
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('members.register'), [
            'member' => [
                'name' => 'Sari Dewi',
                'phone' => '6281234567890',
            ],
            'package_ids' => [$package->id],
            'payment_method' => 'cash',
        ]);

        $membership = Membership::first();
        $this->assertNotNull($membership);
        $this->assertNull($membership->start_date);
        $this->assertNull($membership->end_date);
    }

    public function test_first_check_in_activates_membership_from_check_in_date(): void
    {
        Carbon::setTestNow('2026-07-17 08:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('members.register'), [
            'member' => [
                'name' => 'Budi Santoso',
                'phone' => '6289876543210',
            ],
            'package_ids' => [$package->id],
            'payment_method' => 'cash',
        ]);

        $member = Member::where('phone', '6289876543210')->firstOrFail();
        $membership = Membership::where('member_id', $member->id)->firstOrFail();

        $this->assertNull($membership->start_date);

        $this->actingAs($admin);
        app(CashierService::class)->checkIn($member, $gymClass);

        $membership->refresh();
        $this->assertSame('2026-07-17', $membership->start_date->toDateString());
        $this->assertSame('2026-08-17', $membership->end_date->toDateString());
    }

    public function test_second_check_in_does_not_change_membership_dates(): void
    {
        Carbon::setTestNow('2026-07-17 08:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('members.register'), [
            'member' => [
                'name' => 'Andi Wijaya',
                'phone' => '6281111222333',
            ],
            'package_ids' => [$package->id],
            'payment_method' => 'cash',
        ]);

        $member = Member::where('phone', '6281111222333')->firstOrFail();
        $cashier = app(CashierService::class);

        $this->actingAs($admin);
        $cashier->checkIn($member, $gymClass);

        Carbon::setTestNow('2026-07-20 09:00:00');
        $cashier->checkIn($member, $gymClass);

        $membership = Membership::where('member_id', $member->id)->firstOrFail();
        $this->assertSame('2026-07-17', $membership->start_date->toDateString());
        $this->assertSame('2026-08-17', $membership->end_date->toDateString());
    }
}
