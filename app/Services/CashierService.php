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
            ->with(['activeMemberships' => function ($q) {
                $q->where(function ($q) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::today());
                })->orderBy('end_date');
            }, 'activeMemberships.details.gymClass'])
            ->orderBy('name')
            ->limit(10)
            ->get();
    }

    /**
     * Cari MembershipDetail yang berhak dipakai untuk gym class tertentu,
     * mengikuti aturan FIFO (membership dengan expiry paling dekat didahulukan).
     * Unlimited selalu diprioritaskan tanpa mengurangi kuota jika ditemukan pada urutan FIFO tsb.
     */
    public function resolveEligibleDetail(Member $member, GymClass $gymClass): ?MembershipDetail
    {
        $memberships = Membership::query()
            ->where('member_id', $member->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::today());
            })
            ->with(['details' => fn ($q) => $q->where('gym_class_id', $gymClass->id), 'details.membership'])
            ->orderByRaw('end_date IS NULL, end_date ASC')
            ->get();

        foreach ($memberships as $membership) {
            $detail = $membership->details->first();

            if (! $detail) {
                continue;
            }

            if ($detail->is_unlimited) {
                return $detail;
            }

            if (($detail->quota ?? 0) - $detail->quota_used > 0) {
                return $detail;
            }
        }

        return null;
    }

    public function checkIn(Member $member, GymClass $gymClass): Attendance
    {
        return DB::transaction(function () use ($member, $gymClass) {
            $detail = $this->resolveEligibleDetail($member, $gymClass);

            if (! $detail) {
                throw new RuntimeException('Kuota habis. Silakan beli paket baru.');
            }

            $quotaBefore = $detail->is_unlimited ? null : $detail->remainingQuota();

            if (! $detail->is_unlimited) {
                $detail->increment('quota_used');
                $detail->refresh();
            }

            $quotaAfter = $detail->is_unlimited ? null : $detail->remainingQuota();

            $attendance = Attendance::create([
                'member_id' => $member->id,
                'gym_class_id' => $gymClass->id,
                'class_name' => $gymClass->name,
                'membership_id' => $detail->membership_id,
                'membership_detail_id' => $detail->id,
                'package_name' => $detail->membership->package_name ?? null,
                'quota_before' => $quotaBefore,
                'quota_after' => $quotaAfter,
                'is_unlimited' => $detail->is_unlimited,
                'checked_in_at' => now(),
                'created_by' => auth()->id(),
            ]);

            MemberTimeline::create([
                'member_id' => $member->id,
                'type' => 'checkin',
                'title' => "Check In {$gymClass->name}",
                'description' => $detail->is_unlimited
                    ? 'Kuota unlimited'
                    : "Sisa kuota: {$detail->remainingQuota()}x",
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
