<?php

declare(strict_types=1);

namespace App\Services;

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
            foreach ($details as $detail) {
                $isUnlimited = $detail['is_unlimited'] ?? false;

                $membership->details()->where('id', $detail['id'])->update([
                    'is_unlimited' => $isUnlimited,
                    'quota'        => $isUnlimited ? null : ($detail['quota'] ?? 0),
                    'quota_used'   => $detail['quota_used'] ?? 0,
                ]);
            }

            $this->applyExpiryUpdate($membership, $expiry);

            return $membership->fresh(['details.gymClass', 'membershipPackage']);
        });
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

        if ($expiredType !== null && $startDate !== null) {
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
    }
}
