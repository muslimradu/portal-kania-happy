<?php

declare(strict_types=1);

namespace App\Services\Reports;

use App\Models\Member;
use App\Models\Membership;
use App\Support\ReportDateRange;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MembershipReportService
{
    private const SORTABLE = ['created_at', 'start_date', 'end_date', 'package_name', 'price'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE, true) ? $filters['sort_by'] : 'created_at';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $paginator = $this->baseQuery($filters)
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage, ['*'], 'page')
            ->withQueryString();

        $paginator->getCollection()->transform(fn (Membership $m) => $this->decorate($m));

        return $paginator;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function summary(array $filters): array
    {
        $today = Carbon::today();
        $soonEnd = $today->copy()->addDays(7);
        $filters['expired_status'] = null;

        $stats = $this->filteredQuery($filters)
            ->selectRaw("
                COUNT(DISTINCT member_id) as total_members,
                SUM(CASE
                    WHEN status = 'cancelled' THEN 0
                    WHEN end_date IS NULL OR end_date >= ? THEN 1
                    ELSE 0
                END) as active_members,
                SUM(CASE
                    WHEN status = 'cancelled' THEN 0
                    WHEN end_date IS NOT NULL AND end_date < ? THEN 1
                    ELSE 0
                END) as expired_members,
                SUM(CASE
                    WHEN end_date IS NOT NULL AND end_date BETWEEN ? AND ? THEN 1
                    ELSE 0
                END) as expiring_soon
            ", [$today->toDateString(), $today->toDateString(), $today->toDateString(), $soonEnd->toDateString()])
            ->first();

        $newMembersThisMonth = Member::whereBetween('created_at', [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()])->count();

        return [
            'total_members' => (int) ($stats->total_members ?? 0),
            'active_members' => (int) ($stats->active_members ?? 0),
            'expired_members' => (int) ($stats->expired_members ?? 0),
            'expiring_soon' => (int) ($stats->expiring_soon ?? 0),
            'new_members_this_month' => $newMembersThisMonth,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    public function exportRows(array $filters): array
    {
        return $this->baseQuery($filters)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Membership $m) => $this->decorate($m))
            ->toArray();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function baseQuery(array $filters): Builder
    {
        $query = $this->filteredQuery($filters);

        return $query
            ->select('memberships.*')
            ->selectSub(function ($q) {
                $q->from('attendances')
                    ->selectRaw('MAX(checked_in_at)')
                    ->where('source', 'checkin')
                    ->whereColumn('attendances.member_id', 'memberships.member_id');
            }, 'last_checkin_at')
            ->with(['member:id,uuid,name,phone', 'membershipPackage:id,uuid,name', 'details']);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function filteredQuery(array $filters): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $packageId = $filters['membership_package_id'] ?? null;
        $expiredStatus = $filters['expired_status'] ?? null;

        [$from, $to] = ReportDateRange::resolve(
            $filters['date_preset'] ?? null,
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null,
        );

        $today = Carbon::today();

        $query = Membership::query();

        if ($search !== '') {
            $query->whereHas('member', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }
        if ($packageId) {
            $query->where('membership_package_id', $packageId);
        }
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($expiredStatus === 'active') {
            $query->where('status', '!=', 'cancelled')
                ->where(function ($q) use ($today) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', $today);
                });
        } elseif ($expiredStatus === 'expired') {
            $query->where(function ($q) use ($today) {
                $q->where('status', 'expired')
                    ->orWhere(function ($sub) use ($today) {
                        $sub->whereNotNull('end_date')->where('end_date', '<', $today);
                    });
            });
        } elseif ($expiredStatus === 'expiring_in_7_days') {
            $query->whereNotNull('end_date')
                ->whereBetween('end_date', [$today, $today->copy()->addDays(7)]);
        }

        return $query;
    }

    private function computeStatus(Membership $membership): string
    {
        if ($membership->status === 'cancelled') {
            return 'cancelled';
        }
        if ($membership->end_date && Carbon::parse($membership->end_date)->isPast()) {
            return 'expired';
        }

        return 'active';
    }

    /**
     * @return array<string, mixed>
     */
    private function decorate(Membership $membership): array
    {
        $details = $membership->details;
        $isUnlimited = $details->contains(fn ($d) => (bool) $d->is_unlimited);
        $remainingQuota = $isUnlimited
            ? null
            : (int) $details
                ->filter(fn ($d) => $d->quota_group === null || $d->quota !== null)
                ->sum(fn ($d) => $d->remainingQuota());

        return [
            'uuid' => $membership->uuid,
            'member_name' => $membership->member?->name ?? '-',
            'member_phone' => $membership->member?->phone ?? '-',
            'package_name' => $membership->package_name,
            'purchase_date' => $membership->created_at?->toDateString(),
            'activation_date' => optional($membership->start_date)->toDateString(),
            'expired_date' => optional($membership->end_date)->toDateString(),
            'current_status' => $this->computeStatus($membership),
            'remaining_quota' => $remainingQuota,
            'is_unlimited' => $isUnlimited,
            'last_checkin_at' => $membership->getAttribute('last_checkin_at'),
            'price' => (float) $membership->price,
        ];
    }
}
