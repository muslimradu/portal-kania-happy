<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\GymClass;
use App\Models\Member;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TodayAttendanceSeeder extends Seeder
{
    private const TARGET_COUNT = 23;

    /** @var array<int, string> */
    private array $nonMemberNames = [
        'Budi Santoso',
        'Siti Rahayu',
        'Agus Wijaya',
        'Dewi Lestari',
        'Rizky Pratama',
        'Maya Indira',
        'Fajar Nugroho',
        'Lina Kartika',
        'Hendra Gunawan',
        'Nadia Putri',
        'Yoga Permana',
        'Fitri Handayani',
        'Doni Saputra',
        'Wulan Sari',
        'Eko Prasetyo',
    ];

    public function run(): void
    {
        $adminId = User::query()->value('id');
        $gymClasses = GymClass::query()->get(['id', 'name', 'price']);

        if ($gymClasses->isEmpty()) {
            $this->command?->warn('Tidak ada kelas senam. Seed gym classes terlebih dahulu.');

            return;
        }

        $today = Carbon::today();
        $from = $today->copy()->startOfDay();
        $to = $today->copy()->endOfDay();

        Attendance::query()->whereBetween('checked_in_at', [$from, $to])->delete();
        Transaction::query()
            ->whereBetween('created_at', [$from, $to])
            ->where('status', 'paid')
            ->forceDelete();

        $members = Member::query()
            ->with(['memberships.details.gymClass'])
            ->where('is_active', true)
            ->get();

        $records = [];
        $memberSlots = (int) ceil(self::TARGET_COUNT * 0.6);
        $nonMemberSlots = self::TARGET_COUNT - $memberSlots;

        for ($i = 0; $i < $memberSlots; $i++) {
            if ($members->isEmpty()) {
                $nonMemberSlots += ($memberSlots - $i);
                break;
            }

            $member = $members[$i % $members->count()];
            $gymClass = $gymClasses[$i % $gymClasses->count()];
            $membership = $member->memberships->first();
            $detail = $membership?->details->firstWhere('gym_class_id', $gymClass->id)
                ?? $membership?->details->first();

            $records[] = [
                'type' => 'attendance',
                'member' => $member,
                'gym_class' => $gymClass,
                'membership' => $membership,
                'detail' => $detail,
                'time' => $today->copy()->setTime(8, 0)->addMinutes($i * 17),
            ];
        }

        for ($i = 0; $i < $nonMemberSlots; $i++) {
            $records[] = [
                'type' => 'transaction',
                'name' => $this->nonMemberNames[$i % count($this->nonMemberNames)],
                'gym_class' => $gymClasses[($memberSlots + $i) % $gymClasses->count()],
                'payment_method' => ['cash', 'transfer', 'qris'][$i % 3],
                'time' => $today->copy()->setTime(9, 15)->addMinutes(($memberSlots + $i) * 14),
            ];
        }

        usort($records, fn (array $a, array $b) => $a['time']->timestamp <=> $b['time']->timestamp);

        $invoiceSequence = (int) Transaction::query()
            ->where('invoice_number', 'like', 'INV-'.$today->format('Ymd').'-%')
            ->count();

        foreach ($records as $record) {
            if ($record['type'] === 'attendance') {
                Attendance::create([
                    'member_id' => $record['member']->id,
                    'gym_class_id' => $record['gym_class']->id,
                    'class_name' => $record['gym_class']->name,
                    'membership_id' => $record['membership']?->id,
                    'membership_detail_id' => $record['detail']?->id,
                    'package_name' => $record['membership']?->package_name,
                    'quota_before' => $record['detail']?->remainingQuota(),
                    'quota_after' => $record['detail']?->remainingQuota(),
                    'is_unlimited' => (bool) ($record['detail']?->is_unlimited ?? false),
                    'checked_in_at' => $record['time'],
                    'created_by' => $adminId,
                ]);

                continue;
            }

            $invoiceSequence++;
            $invoiceNumber = sprintf('INV-%s-%04d', $today->format('Ymd'), $invoiceSequence);

            Transaction::create([
                'invoice_number' => $invoiceNumber,
                'customer_name' => $record['name'],
                'customer_phone' => '08'.random_int(1000000000, 9999999999),
                'gym_class_id' => $record['gym_class']->id,
                'class_name' => $record['gym_class']->name,
                'payment_method' => $record['payment_method'],
                'amount' => $record['gym_class']->price,
                'status' => 'paid',
                'created_by' => $adminId,
                'updated_by' => $adminId,
                'created_at' => $record['time'],
                'updated_at' => $record['time'],
            ]);
        }

        $total = Attendance::query()->whereBetween('checked_in_at', [$from, $to])->count()
            + Transaction::query()->whereBetween('created_at', [$from, $to])->where('status', 'paid')->count();

        $this->command?->info("Daftar hadir hari ini: {$total} record.");
    }
}
