<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\GymClass;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Support\AppliesListStatusFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GymClassService
{
    public function paginate(
        ?string $search = null,
        ?string $status = null,
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
        int $perPage = 10,
    ): LengthAwarePaginator {
        return GymClass::withTrashed()
            ->when($search, fn (Builder $q) => $q->where('name', 'like', "%{$search}%"))
            ->tap(fn (Builder $q) => AppliesListStatusFilter::apply($q, $status))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): GymClass
    {
        return DB::transaction(function () use ($data) {
            return GymClass::create([
                ...$data,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        });
    }

    public function update(GymClass $gymClass, array $data): GymClass
    {
        return DB::transaction(function () use ($gymClass, $data) {
            $gymClass->update([
                ...$data,
                'updated_by' => auth()->id(),
            ]);
            return $gymClass->fresh();
        });
    }

    public function delete(GymClass $gymClass): void
    {
        $gymClass->delete();
    }

    public function restore(string $uuid): GymClass
    {
        $gymClass = GymClass::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $gymClass->restore());
        return $gymClass;
    }

    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return GymClass::active()->orderBy('name')->get();
    }
}