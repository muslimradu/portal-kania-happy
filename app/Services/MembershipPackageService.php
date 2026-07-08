<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\MembershipPackage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Support\AppliesListStatusFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class MembershipPackageService
{
    public function paginate(
        ?string $search = null,
        ?string $status = null,
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
        int $perPage = 10,
    ): LengthAwarePaginator {
        return MembershipPackage::withTrashed()
            ->with(['details.gymClass'])
            ->when($search, fn (Builder $q) => $q->where('name', 'like', "%{$search}%"))
            ->tap(fn (Builder $q) => AppliesListStatusFilter::apply($q, $status))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, array $details): MembershipPackage
    {
        return DB::transaction(function () use ($data, $details) {
            $package = MembershipPackage::create([
                ...$data,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            $this->syncDetails($package, $details);

            return $package->load('details.gymClass');
        });
    }

    public function update(MembershipPackage $package, array $data, array $details): MembershipPackage
    {
        return DB::transaction(function () use ($package, $data, $details) {
            $package->update([
                ...$data,
                'updated_by' => auth()->id(),
            ]);

            $this->syncDetails($package, $details);

            return $package->fresh('details.gymClass');
        });
    }

    public function delete(MembershipPackage $package): void
    {
        $package->delete();
    }

    public function restore(string $uuid): MembershipPackage
    {
        $package = MembershipPackage::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $package->restore());
        return $package;
    }

    private function syncDetails(MembershipPackage $package, array $details): void
    {
        $package->details()->delete();

        foreach ($details as $detail) {
            $package->details()->create([
                'gym_class_id' => $detail['gym_class_id'],
                'quota_group'  => $detail['quota_group'] ?? null,
                'quota'        => $detail['is_unlimited'] ? null : ($detail['quota'] ?? null),
                'is_unlimited' => $detail['is_unlimited'],
            ]);
        }
    }
}
