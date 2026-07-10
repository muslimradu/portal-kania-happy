<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Attendance;
use App\Models\FinancialTransaction;
use App\Models\Invoice;
use App\Models\MemberTimeline;
use App\Models\Membership;
use App\Models\MembershipPackage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MembershipService
{
    public function __construct(
        private readonly MembershipDurationService $membershipDurationService,
    ) {}

    /**
     * @param  array<int, array<string, mixed>>  $details
     * @param  array<string, mixed>  $expiry
     */
    public function updateQuota(Membership $membership, array $details, array $expiry = []): Membership
    {
        return DB::transaction(function () use ($membership, $details, $expiry) {
            $membership->loadMissing('details');
            $before = [
                'start_date' => $membership->start_date?->toDateString(),
                'end_date' => $membership->end_date?->toDateString(),
                'details' => $membership->details->mapWithKeys(fn ($d) => [
                    $d->id => [
                        'is_unlimited' => (bool) $d->is_unlimited,
                        'quota' => $d->quota,
                        'quota_used' => $d->quota_used,
                        'class_name' => $d->class_name,
                    ],
                ])->all(),
            ];

            foreach ($details as $detail) {
                $isUnlimited = $detail['is_unlimited'] ?? false;

                $membership->details()->where('id', $detail['id'])->update([
                    'is_unlimited' => $isUnlimited,
                    'quota'        => $isUnlimited ? null : ($detail['quota'] ?? 0),
                    'quota_used'   => $detail['quota_used'] ?? 0,
                ]);
            }

            $membership->refresh()->load('details');

            $beforeHadUsage = $this->detailsHaveQuotaUsage($before['details']);
            $afterHasUsage = $this->membershipHasQuotaUsage($membership);
            $wasUnactivated = $before['start_date'] === null;

            if ($beforeHadUsage && ! $afterHasUsage) {
                // Used → 0: back to pre-check-in (ignore stale form dates)
                $membership->update([
                    'start_date' => null,
                    'end_date' => null,
                    'updated_by' => auth()->id(),
                ]);
                $membership->refresh();
                $membership->syncExpiredStatus();
            } elseif ($wasUnactivated && $afterHasUsage && empty($expiry['start_date'])) {
                // 0 → used without start date: activate from edit date
                $this->membershipDurationService->activateOnFirstCheckIn($membership);
            } else {
                $this->applyExpiryUpdate($membership, $expiry);
                $membership->refresh();
                $membership->syncExpiredStatus();
            }

            $membership = $membership->fresh(['details.gymClass', 'membershipPackage']);

            $this->recordQuotaEditAttendances($membership, $before['details'], $details);

            MemberTimeline::create([
                'member_id' => $membership->member_id,
                'type' => 'update',
                'title' => "Mengubah Paket {$membership->package_name}",
                'description' => $this->buildUpdateDescription($before, $membership, $details),
                'reference_type' => Membership::class,
                'reference_id' => $membership->id,
            ]);

            return $membership;
        });
    }

    public function delete(Membership $membership): void
    {
        DB::transaction(function () use ($membership) {
            $invoiceId = $membership->invoice_id;
            $membershipPrice = (float) $membership->price;

            MemberTimeline::query()
                ->where('reference_type', Membership::class)
                ->where('reference_id', $membership->id)
                ->delete();

            $membership->details()->delete();
            $membership->forceDelete();

            if (! $invoiceId) {
                return;
            }

            $remainingCount = Membership::query()->where('invoice_id', $invoiceId)->count();

            $financialTransactions = FinancialTransaction::query()
                ->where('invoice_id', $invoiceId)
                ->where('category', 'membership')
                ->get();

            if ($remainingCount === 0) {
                foreach ($financialTransactions as $transaction) {
                    $transaction->delete();
                }

                Invoice::query()->whereKey($invoiceId)->forceDelete();

                return;
            }

            foreach ($financialTransactions as $transaction) {
                $newAmount = max(0, (float) $transaction->amount - $membershipPrice);

                if ($newAmount <= 0) {
                    $transaction->delete();
                } else {
                    $transaction->update(['amount' => $newAmount]);
                }
            }

            $invoice = Invoice::query()->find($invoiceId);

            if (! $invoice) {
                return;
            }

            $newTotal = max(0, (float) $invoice->total_amount - $membershipPrice);

            if ($newTotal <= 0) {
                $invoice->forceDelete();
            } else {
                $invoice->update([
                    'total_amount' => $newTotal,
                    'updated_by' => auth()->id(),
                ]);
            }
        });
    }

    public function syncExpiredStatusesForMember(int $memberId): void
    {
        Membership::query()
            ->where('member_id', $memberId)
            ->where('status', '!=', 'cancelled')
            ->each(fn (Membership $membership) => $membership->syncExpiredStatus());
    }

    /**
     * @param  array<int, array<string, mixed>>  $details
     */
    private function detailsHaveQuotaUsage(array $details): bool
    {
        foreach ($details as $detail) {
            if (! ($detail['is_unlimited'] ?? false) && (int) ($detail['quota_used'] ?? 0) > 0) {
                return true;
            }
        }

        return false;
    }

    private function membershipHasQuotaUsage(Membership $membership): bool
    {
        return $membership->details
            ->filter(fn ($d) => $d->quota_group === null || $d->quota !== null)
            ->contains(fn ($d) => ! $d->is_unlimited && $d->quota_used > 0);
    }

    /**
     * @param  array<int, array<string, mixed>>  $beforeDetails
     * @param  array<int, array<string, mixed>>  $details
     */
    private function recordQuotaEditAttendances(Membership $membership, array $beforeDetails, array $details): void
    {
        $now = now();

        foreach ($details as $detailInput) {
            $old = $beforeDetails[$detailInput['id']] ?? null;
            $detail = $membership->details->firstWhere('id', $detailInput['id']);
            if (! $old || ! $detail) {
                continue;
            }

            $isUnlimited = (bool) ($detailInput['is_unlimited'] ?? false);
            $quota = $isUnlimited ? null : (int) ($detailInput['quota'] ?? 0);
            $quotaUsed = (int) ($detailInput['quota_used'] ?? 0);

            if (
                (bool) $old['is_unlimited'] === $isUnlimited
                && $old['quota'] == $quota
                && (int) $old['quota_used'] === $quotaUsed
            ) {
                continue;
            }

            $quotaBefore = ($old['is_unlimited'] ?? false)
                ? null
                : max(0, (int) ($old['quota'] ?? 0) - (int) ($old['quota_used'] ?? 0));
            $quotaAfter = $isUnlimited ? null : max(0, ($quota ?? 0) - $quotaUsed);

            Attendance::create([
                'member_id' => $membership->member_id,
                'gym_class_id' => $detail->gym_class_id,
                'class_name' => $detail->class_name,
                'membership_id' => $membership->id,
                'membership_detail_id' => $detail->id,
                'package_name' => $membership->package_name,
                'quota_before' => $quotaBefore,
                'quota_after' => $quotaAfter,
                'is_unlimited' => $isUnlimited,
                'source' => 'quota_edit',
                'checked_in_at' => $now,
                'created_by' => auth()->id(),
            ]);
        }
    }

    /**
     * @param  array{start_date: ?string, end_date: ?string, details: array<int, array<string, mixed>>}  $before
     * @param  array<int, array<string, mixed>>  $details
     */
    private function buildUpdateDescription(array $before, Membership $membership, array $details): string
    {
        $parts = [];

        foreach ($details as $detail) {
            $old = $before['details'][$detail['id']] ?? null;
            if (! $old) {
                continue;
            }

            $isUnlimited = (bool) ($detail['is_unlimited'] ?? false);
            $quota = $isUnlimited ? null : ($detail['quota'] ?? 0);
            $quotaUsed = $detail['quota_used'] ?? 0;
            $label = $old['class_name'] ?? 'Kelas';

            if ((bool) $old['is_unlimited'] !== $isUnlimited || $old['quota'] != $quota || $old['quota_used'] != $quotaUsed) {
                $from = $old['is_unlimited'] ? 'Unlimited' : "{$old['quota_used']}/{$old['quota']}";
                $to = $isUnlimited ? 'Unlimited' : "{$quotaUsed}/{$quota}";
                $parts[] = "{$label}: {$from} → {$to}";
            }
        }

        $newStart = $membership->start_date?->toDateString();
        $newEnd = $membership->end_date?->toDateString();

        if ($before['start_date'] !== $newStart || $before['end_date'] !== $newEnd) {
            $parts[] = sprintf(
                'Masa berlaku: %s – %s → %s – %s',
                $before['start_date'] ?? '-',
                $before['end_date'] ?? '-',
                $newStart ?? '-',
                $newEnd ?? '-',
            );
        }

        return $parts === [] ? 'Detail membership diperbarui' : implode('; ', $parts);
    }

    /**
     * @param  array<string, mixed>  $expiry
     */
    private function applyExpiryUpdate(Membership $membership, array $expiry): void
    {
        if ($expiry === []) {
            return;
        }

        $startDate = array_key_exists('start_date', $expiry)
            ? ($expiry['start_date'] ? Carbon::parse($expiry['start_date']) : null)
            : $membership->start_date;

        $expiredType = $expiry['expired_type'] ?? null;
        $expiredDuration = isset($expiry['expired_duration']) ? (int) $expiry['expired_duration'] : null;

        $endDate = array_key_exists('end_date', $expiry) && $expiry['end_date']
            ? Carbon::parse($expiry['end_date'])
            : $membership->end_date;

        if ($startDate === null) {
            $endDate = null;
        } elseif ($expiredType !== null) {
            if ($expiredType === 'manual') {
                $endDate = array_key_exists('end_date', $expiry)
                    ? ($expiry['end_date'] ? Carbon::parse($expiry['end_date']) : null)
                    : null;
            } else {
                $package = new MembershipPackage([
                    'expired_type' => $expiredType,
                    'expired_duration' => $expiredDuration,
                ]);
                $endDate = $this->membershipDurationService->calculateEndDate($startDate, $package);
            }
        }

        $membership->update([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'updated_by' => auth()->id(),
        ]);

        $membership->refresh();
        $membership->syncExpiredStatus();
    }
}
