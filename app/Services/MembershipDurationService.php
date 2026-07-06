<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Membership;
use App\Models\MembershipPackage;
use Illuminate\Support\Carbon;

class MembershipDurationService
{
    public function activateOnFirstCheckIn(Membership $membership): void
    {
        if ($membership->start_date !== null) {
            return;
        }

        $membership->loadMissing('membershipPackage');
        $startDate = Carbon::today();

        $membership->update([
            'start_date' => $startDate,
            'end_date' => $membership->membershipPackage
                ? $this->calculateEndDate($startDate, $membership->membershipPackage)
                : null,
            'updated_by' => auth()->id(),
        ]);
    }

    public function calculateEndDate(Carbon $start, MembershipPackage $package): ?Carbon
    {
        return match ($package->expired_type) {
            'days' => $start->copy()->addDays($package->expired_duration ?? 0),
            'weeks' => $start->copy()->addWeeks($package->expired_duration ?? 0),
            'months' => $start->copy()->addMonths($package->expired_duration ?? 0),
            'years' => $start->copy()->addYears($package->expired_duration ?? 0),
            default => null,
        };
    }

    public function durationInDays(?MembershipPackage $package): int
    {
        if (! $package || $package->expired_type === 'manual' || ! $package->expired_duration) {
            return PHP_INT_MAX;
        }

        return match ($package->expired_type) {
            'days' => $package->expired_duration,
            'weeks' => $package->expired_duration * 7,
            'months' => $package->expired_duration * 30,
            'years' => $package->expired_duration * 365,
            default => PHP_INT_MAX,
        };
    }
}
