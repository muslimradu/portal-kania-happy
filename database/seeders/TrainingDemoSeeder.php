<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingParticipantPayment;
use App\Models\User;
use App\Services\MemberService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TrainingDemoSeeder extends Seeder
{
    private const PARTICIPANTS_PER_TRAINING = 20;

    /** @var array<int, string> */
    private array $participantNames = [
        'Fitria Kurniawati',
        'Ahmad Rizki',
        'Siti Nurhaliza',
        'Budi Santoso',
        'Dewi Lestari',
        'Rizky Pratama',
        'Maya Indira',
        'Agus Wijaya',
        'Nadia Putri',
        'Yoga Permana',
        'Lina Kartika',
        'Hendra Gunawan',
        'Wulan Sari',
        'Eko Prasetyo',
        'Putri Maharani',
        'Doni Saputra',
        'Rina Anggraini',
        'Fajar Nugroho',
        'Intan Permata',
        'Bayu Setiawan',
    ];

    public function run(): void
    {
        $adminId = User::query()->value('id');
        $today = Carbon::today();
        $memberService = app(MemberService::class);

        $definitions = [
            [
                'title' => 'Basic Mat Pilates — Akan Datang',
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
                'payment_pattern' => ['pay_later', 'unpaid', 'unpaid', 'paid'],
            ],
            [
                'title' => 'Reformer Pilates Intensif — Berjalan',
                'description' => 'Pelatihan intensif Reformer Pilates untuk instruktur aktif.',
                'trainer_name' => 'Nia Kurniasih',
                'training_dates' => [
                    $today->copy()->subDays(3)->toDateString(),
                    $today->copy()->addDays(4)->toDateString(),
                    $today->copy()->addDays(11)->toDateString(),
                ],
                'training_location' => 'Studio Kania Happy',
                'price' => 2000000,
                'payment_pattern' => ['paid', 'paid', 'unpaid', 'pay_later'],
            ],
            [
                'title' => 'Advanced Mat Pilates — Selesai',
                'description' => 'Pelatihan lanjutan Mat Pilates yang telah selesai diselenggarakan.',
                'trainer_name' => 'Nia Kurniasih',
                'training_dates' => [
                    $today->copy()->subDays(30)->toDateString(),
                    $today->copy()->subDays(29)->toDateString(),
                    $today->copy()->subDays(23)->toDateString(),
                    $today->copy()->subDays(22)->toDateString(),
                ],
                'training_location' => 'Studio Kania Happy',
                'price' => 1750000,
                'payment_pattern' => ['paid', 'paid', 'paid', 'unpaid'],
            ],
        ];

        DB::transaction(function () use ($definitions, $adminId, $memberService, $today) {
            $invoiceSequence = 1;
            $invoiceDate = $today->format('Ymd');

            foreach ($definitions as $definition) {
                $existing = Training::query()->where('title', $definition['title'])->first();

                if ($existing) {
                    TrainingParticipant::query()->where('training_id', $existing->id)->forceDelete();
                    $existing->forceDelete();
                }

                $training = Training::create([
                    'title' => $definition['title'],
                    'description' => $definition['description'],
                    'trainer_name' => $definition['trainer_name'],
                    'training_dates' => $definition['training_dates'],
                    'training_location' => $definition['training_location'],
                    'price' => $definition['price'],
                    'created_by' => $adminId,
                    'updated_by' => $adminId,
                ]);

                for ($i = 0; $i < self::PARTICIPANTS_PER_TRAINING; $i++) {
                    $paymentStatus = $definition['payment_pattern'][$i % count($definition['payment_pattern'])];
                    $paymentMethod = $paymentStatus === 'paid'
                        ? (['cash', 'transfer', 'qris'][$i % 3])
                        : ($paymentStatus === 'pay_later' ? 'pay_later' : 'transfer');

                    $invoiceNumber = sprintf('TRN-%s-%04d', $invoiceDate, $invoiceSequence++);
                    $phone = $memberService->normalizePhone('0812'.str_pad((string) (1000000 + $i + ($training->id * 100)), 8, '0', STR_PAD_LEFT));

                    $availableDates = $training->training_dates ?? [];
                    sort($availableDates);
                    $selectedDates = $availableDates;

                    if (count($availableDates) > 1) {
                        $take = rand(1, count($availableDates));
                        $selectedDates = array_slice($availableDates, 0, $take);
                    }

                    $participant = TrainingParticipant::create([
                        'training_id' => $training->id,
                        'full_name' => $this->participantNames[$i],
                        'phone' => $phone,
                        'payment_status' => $paymentStatus,
                        'payment_method' => $paymentMethod,
                        'invoice_number' => $invoiceNumber,
                        'amount' => $training->price,
                        'selected_training_dates' => $selectedDates,
                        'paid_at' => $paymentStatus === 'paid' ? now()->subDays(rand(1, 10)) : null,
                        'created_by' => $adminId,
                        'updated_by' => $adminId,
                    ]);

                    if ($paymentStatus === 'paid') {
                        TrainingParticipantPayment::create([
                            'training_participant_id' => $participant->id,
                            'invoice_number' => $invoiceNumber,
                            'amount' => $training->price,
                            'payment_method' => in_array($paymentMethod, ['cash', 'transfer', 'qris'], true) ? $paymentMethod : 'cash',
                            'paid_at' => $participant->paid_at ?? now(),
                            'recorded_by' => $adminId,
                        ]);
                    }
                }

                $this->command?->info(sprintf(
                    'Pelatihan "%s" (%s): %d peserta',
                    $training->title,
                    $training->computeNaturalStatus(),
                    self::PARTICIPANTS_PER_TRAINING,
                ));
            }
        });
    }
}
