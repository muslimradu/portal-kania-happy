<?php

declare(strict_types=1);

namespace Tests\Feature\Training;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TrainingManagementTest extends TestCase
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

    private function createTraining(array $overrides = []): Training
    {
        return Training::create(array_merge([
            'title' => 'Basic Mat Pilates',
            'trainer_name' => 'Nia Kurniasih',
            'training_dates' => ['2026-12-06', '2026-12-07'],
            'price' => 1000000,
        ], $overrides));
    }

    public function test_admin_can_create_training(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();

        $response = $this->actingAs($admin)->post(route('trainings.store'), [
            'title' => 'Basic Mat Pilates',
            'description' => 'Pelatihan dasar',
            'trainer_name' => 'Nia Kurniasih',
            'training_dates' => ['2026-12-06', '2026-12-07'],
            'training_location' => 'Studio Kania Happy',
            'price' => 1500000,
        ]);

        $response->assertRedirect();
        $training = Training::first();
        $this->assertNotNull($training);
        $this->assertSame('Basic Mat Pilates', $training->title);
        $this->assertSame('2026-12-06', $training->first_training_date?->toDateString());
        $this->assertSame('2026-12-07', $training->last_training_date?->toDateString());
        $this->assertSame('upcoming', $training->computeNaturalStatus());
    }

    public function test_admin_can_register_participant_with_pay_later(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $training = $this->createTraining();

        $response = $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Fitria',
            'phone' => '081234567890',
            'training_uuid' => $training->uuid,
            'payment_method' => 'pay_later',
            'selected_training_dates' => ['2026-12-06'],
        ]);

        $response->assertRedirect();

        $participant = TrainingParticipant::first();
        $this->assertNotNull($participant);
        $this->assertSame('pay_later', $participant->payment_status);
        $this->assertSame(['2026-12-06'], $participant->selected_training_dates);
        $this->assertStringStartsWith('TRN-', $participant->invoice_number ?? '');
    }

    public function test_participant_must_select_at_least_one_training_date(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $training = $this->createTraining();

        $response = $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Fitria',
            'phone' => '081234567890',
            'training_uuid' => $training->uuid,
            'payment_method' => 'pay_later',
            'selected_training_dates' => [],
        ]);

        $response->assertSessionHasErrors('selected_training_dates');
    }

    public function test_single_date_training_auto_assigns_selected_date(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $training = $this->createTraining([
            'training_dates' => ['2026-12-06'],
        ]);

        $response = $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Fitria',
            'phone' => '081234567890',
            'training_uuid' => $training->uuid,
            'payment_method' => 'pay_later',
        ]);

        $response->assertRedirect();

        $participant = TrainingParticipant::first();
        $this->assertSame(['2026-12-06'], $participant->selected_training_dates);
    }

    public function test_training_show_filters_participants_by_selected_date(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $training = $this->createTraining();

        TrainingParticipant::create([
            'training_id' => $training->id,
            'full_name' => 'Fitria',
            'phone' => '6281111111111',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'invoice_number' => 'TRN-20260606-0001',
            'amount' => 1000000,
            'selected_training_dates' => ['2026-12-06'],
            'paid_at' => now(),
        ]);

        TrainingParticipant::create([
            'training_id' => $training->id,
            'full_name' => 'Budi',
            'phone' => '6281222222222',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'invoice_number' => 'TRN-20260606-0002',
            'amount' => 1000000,
            'selected_training_dates' => ['2026-12-07'],
            'paid_at' => now(),
        ]);

        TrainingParticipant::create([
            'training_id' => $training->id,
            'full_name' => 'Siti',
            'phone' => '6281333333333',
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'invoice_number' => 'TRN-20260606-0003',
            'amount' => 1000000,
            'selected_training_dates' => ['2026-12-06', '2026-12-07'],
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('trainings.show', [
            'training' => $training->uuid,
            'training_date' => '2026-12-06',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('trainings/Show')
            ->has('participants.data', 2)
            ->where('participants.data.0.full_name', 'Fitria')
            ->where('participants.data.1.full_name', 'Siti')
        );
    }

    public function test_training_payment_appears_in_financial_report(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $training = $this->createTraining();

        $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Fitria',
            'phone' => '081234567890',
            'training_uuid' => $training->uuid,
            'payment_method' => 'cash',
            'selected_training_dates' => ['2026-12-06'],
        ])->assertRedirect();

        $response = $this->actingAs($admin)->get(route('financial-reports.index', [
            'category' => 'training',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('financial-reports/Index')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.category', 'training')
            ->where('transactions.data.0.category_label', 'Pelatihan')
            ->where('transactions.data.0.customer_name', 'Fitria')
            ->where('transactions.data.0.amount', 1000000)
        );
    }

    public function test_financial_report_can_filter_training_transactions_by_training(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $pilates = $this->createTraining(['title' => 'Basic Mat Pilates']);
        $zumba = $this->createTraining(['title' => 'Zumba Instructor']);

        $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Fitria',
            'phone' => '081234567890',
            'training_uuid' => $pilates->uuid,
            'payment_method' => 'cash',
            'selected_training_dates' => ['2026-12-06'],
        ])->assertRedirect();

        $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Budi',
            'phone' => '081234567891',
            'training_uuid' => $zumba->uuid,
            'payment_method' => 'cash',
            'selected_training_dates' => ['2026-12-06'],
        ])->assertRedirect();

        $response = $this->actingAs($admin)->get(route('financial-reports.index', [
            'category' => 'training',
            'training_id' => $zumba->id,
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('financial-reports/Index')
            ->where('filters.category', 'training')
            ->where('filters.training_id', (string) $zumba->id)
            ->has('trainings', 2)
            ->has('transactions.data', 1)
            ->where('transactions.data.0.category', 'training')
            ->where('transactions.data.0.customer_name', 'Budi')
        );
    }

    public function test_dashboard_includes_active_trainings(): void
    {
        Carbon::setTestNow('2026-06-01');
        $admin = $this->admin();
        $this->createTraining();

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('active_trainings', 1)
            ->where('active_trainings.0.title', 'Basic Mat Pilates')
            ->where('stats.active_trainings', 1)
        );
    }

    public function test_registration_is_blocked_for_completed_training(): void
    {
        Carbon::setTestNow('2027-01-01');
        $admin = $this->admin();
        $training = $this->createTraining([
            'training_dates' => ['2026-06-06'],
        ]);

        $response = $this->actingAs($admin)->post(route('training-participants.store'), [
            'full_name' => 'Fitria',
            'phone' => '081234567890',
            'training_uuid' => $training->uuid,
            'payment_method' => 'pay_later',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('registration');
    }
}
