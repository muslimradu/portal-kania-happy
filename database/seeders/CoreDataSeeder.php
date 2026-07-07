<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\GymClass;
use App\Models\MembershipPackage;
use App\Models\MembershipPackageDetail;
use App\Models\Training;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CoreDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::query()->value('id');
        $today = Carbon::today();

        DB::transaction(function () use ($adminId, $today) {
            $gymClasses = $this->seedGymClasses($adminId);
            $this->seedMembershipPackages($gymClasses, $adminId);
            $this->seedTrainings($adminId, $today);
        });
    }

    /**
     * @return array<string, GymClass>
     */
    private function seedGymClasses(?int $adminId): array
    {
        $definitions = [
            ['name' => 'Aerobic', 'price' => 25000, 'color_label' => '#EF4444', 'icon' => 'Heart'],
            ['name' => 'Zumba', 'price' => 30000, 'color_label' => '#F59E0B', 'icon' => 'Music'],
            ['name' => 'Yoga', 'price' => 35000, 'color_label' => '#10B981', 'icon' => 'PersonStanding'],
            ['name' => 'Pilates', 'price' => 40000, 'color_label' => '#8B5CF6', 'icon' => 'Activity'],
            ['name' => 'Senam Lansia', 'price' => 20000, 'color_label' => '#3B82F6', 'icon' => 'Wind'],
            ['name' => 'Body Pump', 'price' => 35000, 'color_label' => '#EC4899', 'icon' => 'Dumbbell'],
        ];

        $gymClasses = [];

        foreach ($definitions as $definition) {
            $gymClasses[$definition['name']] = GymClass::firstOrCreate(
                ['name' => $definition['name']],
                [
                    ...$definition,
                    'is_active' => true,
                    'created_by' => $adminId,
                    'updated_by' => $adminId,
                ],
            );
        }

        return $gymClasses;
    }

    /**
     * @param  array<string, GymClass>  $gymClasses
     */
    private function seedMembershipPackages(array $gymClasses, ?int $adminId): void
    {
        $definitions = [
            [
                'name' => 'Paket Basic 1 Bulan',
                'price' => 300000,
                'description' => 'Akses 12x untuk Aerobic dan Senam Lansia selama 1 bulan.',
                'expired_duration' => 1,
                'expired_type' => 'months',
                'details' => [
                    ['class' => 'Aerobic', 'quota' => 12, 'is_unlimited' => false],
                    ['class' => 'Senam Lansia', 'quota' => 12, 'is_unlimited' => false],
                ],
            ],
            [
                'name' => 'Paket Premium 3 Bulan',
                'price' => 750000,
                'description' => 'Akses 36x untuk Aerobic, Zumba, dan Yoga selama 3 bulan.',
                'expired_duration' => 3,
                'expired_type' => 'months',
                'details' => [
                    ['class' => 'Aerobic', 'quota' => 36, 'is_unlimited' => false],
                    ['class' => 'Zumba', 'quota' => 36, 'is_unlimited' => false],
                    ['class' => 'Yoga', 'quota' => 36, 'is_unlimited' => false],
                ],
            ],
            [
                'name' => 'Paket Unlimited 6 Bulan',
                'price' => 1500000,
                'description' => 'Akses unlimited ke semua kelas selama 6 bulan.',
                'expired_duration' => 6,
                'expired_type' => 'months',
                'details' => [
                    ['class' => 'Aerobic', 'quota' => null, 'is_unlimited' => true],
                    ['class' => 'Zumba', 'quota' => null, 'is_unlimited' => true],
                    ['class' => 'Yoga', 'quota' => null, 'is_unlimited' => true],
                    ['class' => 'Pilates', 'quota' => null, 'is_unlimited' => true],
                    ['class' => 'Senam Lansia', 'quota' => null, 'is_unlimited' => true],
                    ['class' => 'Body Pump', 'quota' => null, 'is_unlimited' => true],
                ],
            ],
            [
                'name' => 'Paket Harian 7 Hari',
                'price' => 150000,
                'description' => 'Akses 7x ke satu kelas pilihan selama 7 hari.',
                'expired_duration' => 7,
                'expired_type' => 'days',
                'details' => [
                    ['class' => 'Pilates', 'quota' => 7, 'is_unlimited' => false],
                    ['class' => 'Body Pump', 'quota' => 7, 'is_unlimited' => false],
                ],
            ],
        ];

        foreach ($definitions as $definition) {
            $package = MembershipPackage::firstOrCreate(
                ['name' => $definition['name']],
                [
                    'price' => $definition['price'],
                    'description' => $definition['description'],
                    'expired_duration' => $definition['expired_duration'],
                    'expired_type' => $definition['expired_type'],
                    'is_active' => true,
                    'created_by' => $adminId,
                    'updated_by' => $adminId,
                ],
            );

            if ($package->details()->exists()) {
                continue;
            }

            foreach ($definition['details'] as $detail) {
                MembershipPackageDetail::create([
                    'membership_package_id' => $package->id,
                    'gym_class_id' => $gymClasses[$detail['class']]->id,
                    'quota' => $detail['is_unlimited'] ? null : $detail['quota'],
                    'is_unlimited' => $detail['is_unlimited'],
                ]);
            }
        }
    }

    private function seedTrainings(?int $adminId, Carbon $today): void
    {
        $definitions = [
            [
                'title' => 'Basic Mat Pilates',
                'description' => 'Pelatihan dasar Mat Pilates untuk calon instruktur pemula.',
                'trainer_name' => 'Nia Kurniasih',
                'training_dates' => [
                    $today->copy()->addDays(14)->toDateString(),
                    $today->copy()->addDays(15)->toDateString(),
                    $today->copy()->addDays(21)->toDateString(),
                    $today->copy()->addDays(22)->toDateString(),
                ],
                'training_location' => 'Studio Kania Happy',
                'price' => 1500000,
            ],
            [
                'title' => 'Reformer Pilates Intensif',
                'description' => 'Pelatihan intensif Reformer Pilates untuk instruktur aktif.',
                'trainer_name' => 'Nia Kurniasih',
                'training_dates' => [
                    $today->copy()->subDays(3)->toDateString(),
                    $today->copy()->addDays(4)->toDateString(),
                    $today->copy()->addDays(11)->toDateString(),
                ],
                'training_location' => 'Studio Kania Happy',
                'price' => 2000000,
            ],
        ];

        foreach ($definitions as $definition) {
            Training::firstOrCreate(
                ['title' => $definition['title']],
                [
                    ...$definition,
                    'created_by' => $adminId,
                    'updated_by' => $adminId,
                ],
            );
        }
    }
}
