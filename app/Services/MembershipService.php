<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Membership;
use Illuminate\Support\Facades\DB;

class MembershipService
{
    public function updateQuota(Membership $membership, array $details): Membership
    {
        return DB::transaction(function () use ($membership, $details) {
            foreach ($details as $detail) {
                $isUnlimited = $detail['is_unlimited'] ?? false;

                $membership->details()->where('id', $detail['id'])->update([
                    'is_unlimited' => $isUnlimited,
                    'quota'        => $isUnlimited ? null : ($detail['quota'] ?? 0),
                    'quota_used'   => $detail['quota_used'] ?? 0,
                ]);
            }

            return $membership->fresh('details.gymClass');
        });
    }
}
