<?php

declare(strict_types=1);

namespace Tests\Feature\PaymentConfiguration;

use App\Models\PaymentConfiguration;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PaymentConfigurationQrisTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        Storage::fake('public');
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');

        return $user;
    }

    public function test_admin_can_create_qris_from_url_without_server_side_png(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->post(route('payment-configurations.qris.store'), [
            'name' => 'QRIS Utama',
            'qris_type' => 'url',
            'qris_url' => 'https://example.com/qris-static',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $qris = PaymentConfiguration::first();
        $this->assertNotNull($qris);
        $this->assertSame('qris', $qris->type);
        $this->assertSame('url', $qris->qris_type);
        $this->assertSame('https://example.com/qris-static', $qris->qris_url);
        $this->assertNull($qris->qris_image);
        Storage::disk('public')->assertDirectoryEmpty('payment/qris');
    }

    public function test_admin_can_create_qris_from_upload(): void
    {
        $admin = $this->admin();
        $file = UploadedFile::fake()->image('qris.png', 300, 300);

        $response = $this->actingAs($admin)->post(route('payment-configurations.qris.store'), [
            'name' => 'QRIS Upload',
            'qris_type' => 'upload',
            'qris_image_file' => $file,
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $qris = PaymentConfiguration::first();
        $this->assertNotNull($qris);
        $this->assertSame('upload', $qris->qris_type);
        $this->assertNotNull($qris->qris_image);
        Storage::disk('public')->assertExists($qris->qris_image);
    }
}
