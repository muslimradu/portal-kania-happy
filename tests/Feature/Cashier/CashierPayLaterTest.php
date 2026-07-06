<?php

declare(strict_types=1);

namespace Tests\Feature\Cashier;

use App\Models\FinancialTransaction;
use App\Models\GymClass;
use App\Models\Transaction;
use App\Models\User;
use App\Services\CashierService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CashierPayLaterTest extends TestCase
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

    private function createGymClass(array $overrides = []): GymClass
    {
        return GymClass::create(array_merge([
            'name' => 'Pilates Mat',
            'price' => 75000,
            'color_label' => '#7C3AED',
            'icon' => 'Dumbbell',
            'is_active' => true,
        ], $overrides));
    }

    public function test_checkout_pay_later_creates_unpaid_transaction_without_financial_record(): void
    {
        Carbon::setTestNow('2026-07-06 10:00:00');
        $admin = $this->admin();
        $gymClass = $this->createGymClass();

        $response = $this->actingAs($admin)->post(route('cashier.transactions.store'), [
            'gym_class_uuid' => $gymClass->uuid,
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'payment_method' => 'pay_later',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('cashierResult.pay_later', true);

        $transaction = Transaction::first();
        $this->assertNotNull($transaction);
        $this->assertSame('unpaid', $transaction->status);
        $this->assertSame('pay_later', $transaction->payment_method);
        $this->assertNull($transaction->payment_configuration_id);
        $this->assertStringStartsWith('INV-', $transaction->invoice_number);
        $this->assertDatabaseCount('financial_transactions', 0);
    }

    public function test_process_payment_marks_transaction_paid_and_creates_financial_record(): void
    {
        Carbon::setTestNow('2026-07-06 10:00:00');
        $admin = $this->admin();
        $gymClass = $this->createGymClass();

        $this->actingAs($admin)->post(route('cashier.transactions.store'), [
            'gym_class_uuid' => $gymClass->uuid,
            'customer_name' => 'Siti Aminah',
            'payment_method' => 'pay_later',
        ]);

        $transaction = Transaction::firstOrFail();

        $response = $this->actingAs($admin)->post(route('cashier.transactions.pay', $transaction), [
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $transaction->refresh();
        $this->assertSame('paid', $transaction->status);
        $this->assertSame('cash', $transaction->payment_method);

        $financial = FinancialTransaction::where('transaction_id', $transaction->id)->first();
        $this->assertNotNull($financial);
        $this->assertSame('income', $financial->type);
        $this->assertSame('pos_sale', $financial->category);
        $this->assertSame('75000.00', (string) $financial->amount);
    }

    public function test_pay_later_transaction_appears_in_today_attendance_list_as_unpaid(): void
    {
        Carbon::setTestNow('2026-07-06 14:30:00');
        $admin = $this->admin();
        $gymClass = $this->createGymClass(['name' => 'Zumba']);

        $this->actingAs($admin)->post(route('cashier.transactions.store'), [
            'gym_class_uuid' => $gymClass->uuid,
            'customer_name' => 'Budi Santoso',
            'payment_method' => 'pay_later',
        ]);

        $transaction = Transaction::firstOrFail();
        $list = app(CashierService::class)->todayAttendanceList();

        $this->assertCount(1, $list);
        $this->assertSame($transaction->uuid, $list[0]['uuid']);
        $this->assertSame('Budi Santoso', $list[0]['name']);
        $this->assertSame('Zumba', $list[0]['gym_class']);
        $this->assertSame('non_member', $list[0]['member_status']);
        $this->assertSame('unpaid', $list[0]['payment_status']);
        $this->assertSame(75000.0, $list[0]['amount']);
        $this->assertSame($transaction->invoice_number, $list[0]['invoice_number']);
    }
}
