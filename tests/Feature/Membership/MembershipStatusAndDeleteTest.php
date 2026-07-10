<?php

declare(strict_types=1);

namespace Tests\Feature\Membership;

use App\Models\Attendance;
use App\Models\FinancialTransaction;
use App\Models\GymClass;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\MemberTimeline;
use App\Models\Membership;
use App\Models\MembershipDetail;
use App\Models\MembershipPackage;
use App\Models\MembershipPackageDetail;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MembershipStatusAndDeleteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    private function admin(string $password = 'password'): User
    {
        $user = User::factory()->create([
            'password' => bcrypt($password),
        ]);
        $user->assignRole('Admin');

        return $user;
    }

    /**
     * @return array{0: MembershipPackage, 1: GymClass}
     */
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

    private function createMembershipWithInvoice(Member $member, MembershipPackage $package, GymClass $gymClass): Membership
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-TEST-001',
            'member_id' => $member->id,
            'payment_method' => 'cash',
            'total_amount' => $package->price,
            'status' => 'paid',
            'created_by' => $member->created_by,
            'updated_by' => $member->updated_by,
        ]);

        FinancialTransaction::create([
            'invoice_id' => $invoice->id,
            'type' => 'income',
            'category' => 'membership',
            'amount' => $package->price,
            'payment_method' => 'cash',
            'description' => 'Test membership purchase',
            'transaction_date' => Carbon::today(),
            'created_by' => $member->created_by,
        ]);

        $membership = Membership::create([
            'member_id' => $member->id,
            'membership_package_id' => $package->id,
            'invoice_id' => $invoice->id,
            'package_name' => $package->name,
            'price' => $package->price,
            'status' => 'active',
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-30',
            'created_by' => $member->created_by,
            'updated_by' => $member->updated_by,
        ]);

        MembershipDetail::create([
            'membership_id' => $membership->id,
            'gym_class_id' => $gymClass->id,
            'class_name' => $gymClass->name,
            'quota' => 12,
            'quota_used' => 0,
            'is_unlimited' => false,
        ]);

        return $membership;
    }

    public function test_member_show_syncs_expired_membership_status(): void
    {
        Carbon::setTestNow('2026-07-08 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Budi',
            'phone' => '6281111222333',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $this->assertSame('active', $membership->status);

        $this->actingAs($admin)->get(route('members.show', $member));

        $this->assertSame('expired', $membership->fresh()->status);
    }

    public function test_update_quota_sets_expired_status_when_end_date_is_past(): void
    {
        Carbon::setTestNow('2026-07-08 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Sari',
            'phone' => '6282222333444',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $detail = $membership->details()->firstOrFail();

        $this->actingAs($admin)->patch(route('memberships.update-quota', $membership), [
            'details' => [[
                'id' => $detail->id,
                'is_unlimited' => false,
                'quota' => 12,
                'quota_used' => 0,
            ]],
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-05',
            'expired_type' => 'manual',
            'expired_duration' => null,
        ]);

        $membership->refresh();
        $this->assertSame('expired', $membership->status);
        $this->assertSame('2026-07-05', $membership->end_date?->toDateString());
    }

    public function test_update_quota_creates_timeline_entry(): void
    {
        Carbon::setTestNow('2026-07-08 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Rina',
            'phone' => '6285555666777',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $detail = $membership->details()->firstOrFail();

        $this->actingAs($admin)->patch(route('memberships.update-quota', $membership), [
            'details' => [[
                'id' => $detail->id,
                'is_unlimited' => false,
                'quota' => 10,
                'quota_used' => 2,
            ]],
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-31',
            'expired_type' => 'manual',
            'expired_duration' => null,
        ])->assertRedirect();

        $timeline = MemberTimeline::query()
            ->where('member_id', $member->id)
            ->where('type', 'update')
            ->where('reference_id', $membership->id)
            ->first();

        $this->assertNotNull($timeline);
        $this->assertSame("Mengubah Paket {$membership->package_name}", $timeline->title);
        $this->assertStringContainsString('Aerobic: 0/12 → 2/10', (string) $timeline->description);
    }

    public function test_reset_quota_used_to_zero_clears_activation_dates(): void
    {
        Carbon::setTestNow('2026-07-08 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Tono',
            'phone' => '6286666777888',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $detail = $membership->details()->firstOrFail();
        $detail->update(['quota_used' => 3]);
        $membership->update([
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-05',
            'status' => 'expired',
        ]);

        $this->actingAs($admin)->patch(route('memberships.update-quota', $membership), [
            'details' => [[
                'id' => $detail->id,
                'is_unlimited' => false,
                'quota' => 12,
                'quota_used' => 0,
            ]],
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-05',
            'expired_type' => 'manual',
            'expired_duration' => null,
        ])->assertRedirect();

        $membership->refresh();
        $this->assertNull($membership->start_date);
        $this->assertNull($membership->end_date);
        $this->assertSame('active', $membership->status);
        $this->assertSame(0, $membership->details()->firstOrFail()->quota_used);
    }

    public function test_setting_quota_used_from_zero_activates_from_edit_date(): void
    {
        Carbon::setTestNow('2026-07-10 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Lina',
            'phone' => '6287777888999',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $membership->update(['start_date' => null, 'end_date' => null, 'status' => 'active']);
        $detail = $membership->details()->firstOrFail();

        $this->actingAs($admin)->patch(route('memberships.update-quota', $membership), [
            'details' => [[
                'id' => $detail->id,
                'is_unlimited' => false,
                'quota' => 12,
                'quota_used' => 2,
            ]],
            'start_date' => null,
            'end_date' => null,
            'expired_type' => 'months',
            'expired_duration' => 1,
        ])->assertRedirect();

        $membership->refresh();
        $this->assertSame('2026-07-10', $membership->start_date?->toDateString());
        $this->assertSame('2026-08-10', $membership->end_date?->toDateString());
        $this->assertSame('active', $membership->status);
        $this->assertSame(2, $membership->details()->firstOrFail()->quota_used);
    }

    public function test_update_quota_creates_attendance_row_for_absensi_tab(): void
    {
        Carbon::setTestNow('2026-07-10 11:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin();

        $member = Member::create([
            'name' => 'Yudi',
            'phone' => '6288888999000',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $detail = $membership->details()->firstOrFail();
        $detail->update(['quota_used' => 1]);

        $this->actingAs($admin)->patch(route('memberships.update-quota', $membership), [
            'details' => [[
                'id' => $detail->id,
                'is_unlimited' => false,
                'quota' => 12,
                'quota_used' => 4,
            ]],
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-31',
            'expired_type' => 'manual',
            'expired_duration' => null,
        ])->assertRedirect();

        $attendance = Attendance::query()
            ->where('member_id', $member->id)
            ->where('source', 'quota_edit')
            ->first();

        $this->assertNotNull($attendance);
        $this->assertSame($gymClass->name, $attendance->class_name);
        $this->assertSame($membership->package_name, $attendance->package_name);
        $this->assertSame(11, $attendance->quota_before);
        $this->assertSame(8, $attendance->quota_after);
    }

    public function test_delete_membership_requires_password(): void
    {
        Carbon::setTestNow('2026-07-08 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin('secret-password');

        $member = Member::create([
            'name' => 'Andi',
            'phone' => '6283333444555',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);

        $this->actingAs($admin)
            ->from(route('members.show', $member))
            ->delete(route('memberships.destroy', $membership), [
                'password' => 'wrong-password',
            ])
            ->assertSessionHasErrors('password');

        $this->assertDatabaseHas('memberships', ['id' => $membership->id]);
    }

    public function test_delete_membership_removes_financial_data_permanently(): void
    {
        Carbon::setTestNow('2026-07-08 10:00:00');
        [$package, $gymClass] = $this->createPackageWithClass();
        $admin = $this->admin('secret-password');

        $member = Member::create([
            'name' => 'Dewi',
            'phone' => '6284444555666',
            'is_active' => true,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $membership = $this->createMembershipWithInvoice($member, $package, $gymClass);
        $invoiceId = $membership->invoice_id;

        $this->actingAs($admin)
            ->from(route('members.show', $member))
            ->delete(route('memberships.destroy', $membership), [
                'password' => 'secret-password',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('memberships', ['id' => $membership->id]);
        $this->assertDatabaseMissing('financial_transactions', ['invoice_id' => $invoiceId]);
        $this->assertDatabaseMissing('invoices', ['id' => $invoiceId]);
    }
}
