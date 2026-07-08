<?php

declare(strict_types=1);

namespace Tests\Feature\Membership;

use App\Models\GymClass;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipDetail;
use App\Models\MembershipPackage;
use App\Models\MembershipPackageDetail;
use App\Models\User;
use App\Services\CashierService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MembershipPackageSelectionTest extends TestCase
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

    /**
     * @return array{0: MembershipPackage, 1: GymClass}
     */
    private function createPackageWithClass(
        int $quota = 12,
        string $expiredType = 'months',
        int $expiredDuration = 1,
        string $name = 'Paket Aerobic',
        ?GymClass $gymClass = null,
    ): array {
        $gymClass ??= GymClass::create([
            'name' => 'Aerobic',
            'price' => 25000,
            'color_label' => '#7C3AED',
            'icon' => 'Dumbbell',
            'is_active' => true,
        ]);

        $package = MembershipPackage::create([
            'name' => $name,
            'price' => 300000,
            'expired_type' => $expiredType,
            'expired_duration' => $expiredDuration,
            'is_active' => true,
        ]);

        MembershipPackageDetail::create([
            'membership_package_id' => $package->id,
            'gym_class_id' => $gymClass->id,
            'quota' => $quota,
            'is_unlimited' => false,
        ]);

        return [$package, $gymClass];
    }

    private function createMembership(
        Member $member,
        MembershipPackage $package,
        GymClass $gymClass,
        array $overrides = [],
        int $quota = 12,
        int $quotaUsed = 0,
    ): Membership {
        $membership = Membership::create(array_merge([
            'member_id' => $member->id,
            'membership_package_id' => $package->id,
            'package_name' => $package->name,
            'price' => $package->price,
            'status' => 'active',
            'start_date' => null,
            'end_date' => null,
        ], $overrides));

        MembershipDetail::create([
            'membership_id' => $membership->id,
            'gym_class_id' => $gymClass->id,
            'class_name' => $gymClass->name,
            'quota' => $quota,
            'quota_used' => $quotaUsed,
            'is_unlimited' => false,
        ]);

        return $membership;
    }

    public function test_check_in_uses_shortest_duration_unactivated_package_first(): void
    {
        Carbon::setTestNow('2026-07-10 10:00:00');
        [$shortPackage, $gymClass] = $this->createPackageWithClass(2, 'weeks', 1, 'Paket 1 Minggu');
        [$longPackage] = $this->createPackageWithClass(2, 'months', 1, 'Paket 1 Bulan', $gymClass);
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Rina',
            'phone' => '6285555666777',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $longMembership = $this->createMembership($member, $longPackage, $gymClass, ['created_at' => '2026-07-01']);
        $shortMembership = $this->createMembership($member, $shortPackage, $gymClass, ['created_at' => '2026-07-05']);

        $this->actingAs($admin);
        app(CashierService::class)->checkIn($member, $gymClass);

        $longMembership->refresh();
        $shortMembership->refresh();

        $this->assertSame(0, $longMembership->details()->first()->quota_used);
        $this->assertSame(1, $shortMembership->details()->first()->quota_used);
        $this->assertNotNull($shortMembership->start_date);
        $this->assertNull($longMembership->start_date);
    }

    public function test_activated_package_with_soonest_expiry_is_used_before_unactivated(): void
    {
        Carbon::setTestNow('2026-07-10 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass(2);
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Dewi',
            'phone' => '6284444555666',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $activated = $this->createMembership($member, $package, $gymClass, [
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-15',
            'created_at' => '2026-06-01',
        ]);
        $unactivated = $this->createMembership($member, $package, $gymClass, [
            'created_at' => '2026-07-05',
        ]);

        $this->actingAs($admin);
        app(CashierService::class)->checkIn($member, $gymClass);

        $activated->refresh();
        $unactivated->refresh();

        $this->assertSame(1, $activated->details()->first()->quota_used);
        $this->assertSame(0, $unactivated->details()->first()->quota_used);
    }

    public function test_running_package_is_used_before_newly_purchased_unactivated_package(): void
    {
        Carbon::setTestNow('2026-07-10 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass(2);
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Budi',
            'phone' => '6283333444555',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $running = $this->createMembership($member, $package, $gymClass, [
            'start_date' => '2026-07-01',
            'end_date' => '2026-08-01',
            'created_at' => '2026-07-01',
        ], quota: 2, quotaUsed: 1);

        $newPurchase = $this->createMembership($member, $package, $gymClass, [
            'created_at' => '2026-07-09',
        ]);

        $this->actingAs($admin);
        $cashier = app(CashierService::class);

        // Check-in #2: masih pakai paket yang sudah berjalan
        $cashier->checkIn($member, $gymClass);

        $running->refresh();
        $newPurchase->refresh();

        $this->assertSame(2, $running->details()->first()->quota_used);
        $this->assertSame(0, $newPurchase->details()->first()->quota_used);
        $this->assertNull($newPurchase->start_date);

        // Check-in #3: kuota paket lama habis → pindah ke paket baru
        $cashier->checkIn($member, $gymClass);

        $running->refresh();
        $newPurchase->refresh();

        $this->assertSame(2, $running->details()->first()->quota_used);
        $this->assertSame(1, $newPurchase->details()->first()->quota_used);
        $this->assertNotNull($newPurchase->start_date);
        $this->assertSame('2026-07-10', $newPurchase->start_date->toDateString());
    }

    public function test_shared_quota_group_depletes_across_classes(): void
    {
        Carbon::setTestNow('2026-07-10 10:00:00');
        $admin = $this->admin();

        $aerobic = GymClass::create([
            'name' => 'Aerobic',
            'price' => 25000,
            'color_label' => '#7C3AED',
            'icon' => 'Dumbbell',
            'is_active' => true,
        ]);
        $zumba = GymClass::create([
            'name' => 'Zumba',
            'price' => 30000,
            'color_label' => '#F97316',
            'icon' => 'Music',
            'is_active' => true,
        ]);

        $package = MembershipPackage::create([
            'name' => 'Aero & Zumba 4x',
            'price' => 300000,
            'expired_type' => 'months',
            'expired_duration' => 1,
            'is_active' => true,
        ]);

        MembershipPackageDetail::create([
            'membership_package_id' => $package->id,
            'gym_class_id' => $aerobic->id,
            'quota_group' => 1,
            'quota' => 4,
            'is_unlimited' => false,
        ]);
        MembershipPackageDetail::create([
            'membership_package_id' => $package->id,
            'gym_class_id' => $zumba->id,
            'quota_group' => 1,
            'quota' => null,
            'is_unlimited' => false,
        ]);

        $member = Member::create([
            'name' => 'Rani',
            'phone' => '6287777888999',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = Membership::create([
            'member_id' => $member->id,
            'membership_package_id' => $package->id,
            'package_name' => $package->name,
            'price' => $package->price,
            'status' => 'active',
            'start_date' => '2026-07-01',
            'end_date' => '2026-08-01',
        ]);

        $pool = MembershipDetail::create([
            'membership_id' => $membership->id,
            'gym_class_id' => $aerobic->id,
            'quota_group' => 1,
            'class_name' => 'Aerobic',
            'quota' => 4,
            'quota_used' => 0,
            'is_unlimited' => false,
        ]);
        MembershipDetail::create([
            'membership_id' => $membership->id,
            'gym_class_id' => $zumba->id,
            'quota_group' => 1,
            'class_name' => 'Zumba',
            'quota' => null,
            'quota_used' => 0,
            'is_unlimited' => false,
        ]);

        $this->actingAs($admin);
        $cashier = app(CashierService::class);

        $cashier->checkIn($member, $zumba);
        $cashier->checkIn($member, $zumba);
        $cashier->checkIn($member, $aerobic);
        $cashier->checkIn($member, $aerobic);

        $pool->refresh();
        $this->assertSame(4, $pool->quota_used);

        $this->expectException(\RuntimeException::class);
        $cashier->checkIn($member, $zumba);
    }
}
