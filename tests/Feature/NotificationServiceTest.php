<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Member;
use App\Models\Membership;
use App\Models\StudioBooking;
use App\Models\Training;
use App\Models\User;
use App\Services\NotificationService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
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

    public function test_returns_training_booking_and_membership_notifications(): void
    {
        Carbon::setTestNow('2026-07-05');

        Training::create([
            'title' => 'Basic Mat Pilates',
            'trainer_name' => 'Nia',
            'training_dates' => ['2026-07-05', '2026-07-06'],
            'price' => 1000000,
        ]);

        StudioBooking::create([
            'customer_name' => 'Fitria',
            'customer_phone' => '6281111111111',
            'booking_date' => '2026-07-06',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'status' => 'upcoming',
            'payment_status' => 'paid',
            'price' => 500000,
            'invoice_number' => 'BKG-20260706-0001',
        ]);

        $member = Member::create([
            'name' => 'Budi',
            'phone' => '6281222222222',
        ]);

        Membership::create([
            'member_id' => $member->id,
            'package_name' => 'Paket 10x',
            'status' => 'active',
            'start_date' => '2026-06-01',
            'end_date' => '2026-07-12',
        ]);

        $notifications = app(NotificationService::class)->forUser($this->admin());

        $this->assertGreaterThanOrEqual(4, count($notifications));

        $badges = collect($notifications)->pluck('badge')->all();
        $types = collect($notifications)->pluck('type')->all();

        $this->assertContains('Hari H', $badges);
        $this->assertContains('H-1', $badges);
        $this->assertContains('H-7', $badges);
        $this->assertContains('training', $types);
        $this->assertContains('booking', $types);
        $this->assertContains('membership', $types);
    }

    public function test_notifications_are_shared_on_inertia_requests(): void
    {
        Carbon::setTestNow('2026-07-05');

        Training::create([
            'title' => 'Basic Mat Pilates',
            'trainer_name' => 'Nia',
            'training_dates' => ['2026-07-05'],
            'price' => 1000000,
        ]);

        $response = $this->actingAs($this->admin())->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('notifications', 1)
            ->where('notifications.0.type', 'training')
            ->where('notifications.0.badge', 'Hari H')
        );
    }
}
