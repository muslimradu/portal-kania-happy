<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Attendance;
use App\Models\FinancialTransaction;
use App\Models\GymClass;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipDetail;
use App\Models\MemberTimeline;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CashierService
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
        private readonly MembershipDurationService $membershipDurationService,
    ) {}

    /**
     * @return Collection<int, Member>
     */
    public function searchMembers(string $search): Collection
    {
        return Member::query()
            ->where('is_active', true)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->with([
                'activeMemberships' => function ($q) {
                    $q->where(function ($q) {
                        $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::today());
                    })->with(['details.gymClass', 'membershipPackage:id,expired_type,expired_duration']);
                },
            ])
            ->orderBy('name')
            ->limit(10)
            ->get();
    }

    public function resolveEligibleDetail(Member $member, GymClass $gymClass): ?MembershipDetail
    {
        $memberships = Membership::query()
            ->where('member_id', $member->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::today());
            })
            ->with([
                'details' => fn ($q) => $q->where('gym_class_id', $gymClass->id),
                'details.membership.membershipPackage',
                'membershipPackage',
            ])
            ->get()
            ->sortBy(fn (Membership $membership) => $this->membershipSelectionSortKey($membership))
            ->values();

        foreach ($memberships as $membership) {
            $detail = $membership->details->first();

            if (! $detail) {
                continue;
            }

            $pool = $detail->quotaPool();

            if ($pool->is_unlimited) {
                return $detail;
            }

            if ($pool->remainingQuota() > 0) {
                return $detail;
            }
        }

        return null;
    }

    public function hasUsableMembership(Member $member): bool
    {
        return Membership::query()
            ->where('member_id', $member->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::today());
            })
            ->exists();
    }

    /**
     * @return array{eligible: bool, is_unlimited?: bool, remaining_quota?: int|null, package_name?: string|null, title?: string, message?: string, reason?: string}
     */
    public function checkEligibility(Member $member, GymClass $gymClass): array
    {
        $detail = $this->resolveEligibleDetail($member, $gymClass);

        if ($detail) {
            $pool = $detail->quotaPool();

            return [
                'eligible' => true,
                'is_unlimited' => $pool->is_unlimited,
                'remaining_quota' => $pool->remainingQuota(),
                'package_name' => $detail->membership->package_name ?? null,
            ];
        }

        if (! $this->hasUsableMembership($member)) {
            return [
                'eligible' => false,
                'title' => 'Tidak Ada Membership Aktif',
                'message' => 'Silahkan beli paket membership',
                'reason' => 'no_membership',
            ];
        }

        return [
            'eligible' => false,
            'title' => 'Kuota habis',
            'message' => 'Kuota habis. Silakan beli paket baru.',
            'reason' => 'quota_exhausted',
        ];
    }

    /**
     * @return array{0: int, 1: int, 2: int}
     */
    private function membershipSelectionSortKey(Membership $membership): array
    {
        if ($membership->start_date !== null && $membership->end_date !== null) {
            return [0, $membership->end_date->timestamp, $membership->created_at->timestamp];
        }

        if ($membership->start_date !== null && $membership->end_date === null) {
            return [1, 0, $membership->created_at->timestamp];
        }

        return [
            2,
            $this->membershipDurationService->durationInDays($membership->membershipPackage),
            $membership->created_at->timestamp,
        ];
    }

    public function checkIn(Member $member, GymClass $gymClass): Attendance
    {
        return DB::transaction(function () use ($member, $gymClass) {
            $detail = $this->resolveEligibleDetail($member, $gymClass);

            if (! $detail) {
                if (! $this->hasUsableMembership($member)) {
                    throw new RuntimeException('Silahkan beli paket membership');
                }

                throw new RuntimeException('Kuota habis. Silakan beli paket baru.');
            }

            $membership = $detail->membership;
            $this->membershipDurationService->activateOnFirstCheckIn($membership);
            $membership->refresh();

            $pool = $detail->quotaPool();
            $quotaBefore = $pool->is_unlimited ? null : $pool->remainingQuota();

            if (! $pool->is_unlimited) {
                $pool->increment('quota_used');
                $pool->refresh();
            }

            $quotaAfter = $pool->is_unlimited ? null : $pool->remainingQuota();

            $attendance = Attendance::create([
                'member_id' => $member->id,
                'gym_class_id' => $gymClass->id,
                'class_name' => $gymClass->name,
                'membership_id' => $detail->membership_id,
                'membership_detail_id' => $detail->id,
                'package_name' => $detail->membership->package_name ?? null,
                'quota_before' => $quotaBefore,
                'quota_after' => $quotaAfter,
                'is_unlimited' => $pool->is_unlimited,
                'checked_in_at' => now(),
                'created_by' => auth()->id(),
            ]);

            MemberTimeline::create([
                'member_id' => $member->id,
                'type' => 'checkin',
                'title' => "Check In {$gymClass->name}",
                'description' => $pool->is_unlimited
                    ? 'Kuota unlimited'
                    : "Sisa kuota: {$pool->remainingQuota()}x",
                'reference_type' => Attendance::class,
                'reference_id' => $attendance->id,
            ]);

            app(ActivityLogService::class)->log(
                module: 'attendances',
                action: 'checkin',
                description: "Check-in member {$member->name} pada kelas {$gymClass->name}",
                properties: [
                    'member' => $member->name,
                    'class' => $gymClass->name,
                    'quota_before' => $quotaBefore,
                    'quota_after' => $quotaAfter,
                ],
            );

            return $attendance->load(['member', 'gymClass', 'membership']);
        });
    }

    public function checkoutNonMember(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $gymClass = GymClass::where('uuid', $data['gym_class_uuid'])->firstOrFail();
            $paymentMethod = $data['payment_method'];
            $isPayLater = $paymentMethod === 'pay_later';

            $invoiceNumber = $this->invoiceService->generateInvoiceNumber();

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'gym_class_id' => $gymClass->id,
                'class_name' => $gymClass->name,
                'payment_configuration_id' => $isPayLater ? null : ($data['payment_configuration_id'] ?? null),
                'payment_method' => $paymentMethod,
                'amount' => $gymClass->price,
                'status' => $isPayLater ? 'unpaid' : 'paid',
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            if (! $isPayLater) {
                $this->recordFinancialTransaction($transaction);
            }

            app(ActivityLogService::class)->log(
                module: 'transactions',
                action: 'create',
                description: $isPayLater
                    ? "Transaksi non member (bayar nanti): {$transaction->customer_name} - {$transaction->class_name} (Invoice {$transaction->invoice_number})"
                    : "Transaksi non member: {$transaction->customer_name} - {$transaction->class_name} (Invoice {$transaction->invoice_number})",
                properties: [
                    'invoice_number' => $transaction->invoice_number,
                    'amount' => (string) $transaction->amount,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                ],
            );

            return $transaction->load(['gymClass', 'paymentConfiguration']);
        });
    }

    public function processPayment(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            if ($transaction->status === 'paid') {
                throw new RuntimeException('Transaksi ini sudah lunas.');
            }

            if ($transaction->status === 'cancelled') {
                throw new RuntimeException('Transaksi ini sudah dibatalkan.');
            }

            $transaction->update([
                'payment_method' => $data['payment_method'],
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'status' => 'paid',
                'updated_by' => auth()->id(),
            ]);

            $this->recordFinancialTransaction($transaction->fresh());

            app(ActivityLogService::class)->log(
                module: 'transactions',
                action: 'pay',
                description: "Pembayaran transaksi kasir: {$transaction->customer_name} - {$transaction->class_name} (Invoice {$transaction->invoice_number})",
                properties: [
                    'invoice_number' => $transaction->invoice_number,
                    'amount' => (string) $transaction->amount,
                    'payment_method' => $transaction->payment_method,
                ],
            );

            return $transaction->fresh(['gymClass', 'paymentConfiguration']);
        });
    }

    private function recordFinancialTransaction(Transaction $transaction): void
    {
        FinancialTransaction::create([
            'transaction_id' => $transaction->id,
            'type' => 'income',
            'category' => 'pos_sale',
            'amount' => $transaction->amount,
            'payment_method' => $transaction->payment_method,
            'description' => "Transaksi kasir non member: {$transaction->class_name} - {$transaction->customer_name}",
            'transaction_date' => now()->toDateString(),
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function todayAttendanceList(): array
    {
        $from = Carbon::today()->startOfDay();
        $to = Carbon::today()->endOfDay();

        $transactions = DB::table('transactions')
            ->whereIn('status', ['paid', 'unpaid'])
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw("
                uuid,
                customer_name as name,
                COALESCE(class_name, 'Umum') as gym_class,
                'non_member' as member_status,
                status as payment_status,
                amount,
                invoice_number,
                created_at as checked_in_at
            ");

        $attendances = DB::table('attendances')
            ->join('members', 'attendances.member_id', '=', 'members.id')
            ->where('attendances.source', 'checkin')
            ->whereBetween('attendances.checked_in_at', [$from, $to])
            ->selectRaw("
                attendances.uuid,
                members.name as name,
                COALESCE(attendances.class_name, 'Umum') as gym_class,
                'member' as member_status,
                'paid' as payment_status,
                0 as amount,
                NULL as invoice_number,
                attendances.checked_in_at
            ");

        return DB::query()
            ->fromSub($transactions->unionAll($attendances), 'today_attendance')
            ->orderByDesc('checked_in_at')
            ->get()
            ->map(fn ($row) => [
                'uuid' => (string) $row->uuid,
                'name' => (string) $row->name,
                'gym_class' => (string) $row->gym_class,
                'member_status' => (string) $row->member_status,
                'payment_status' => (string) $row->payment_status,
                'amount' => (float) $row->amount,
                'invoice_number' => $row->invoice_number ? (string) $row->invoice_number : null,
                'checked_in_at' => Carbon::parse($row->checked_in_at)->toIso8601String(),
            ])
            ->all();
    }
}
