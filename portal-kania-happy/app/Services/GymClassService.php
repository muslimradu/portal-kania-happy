<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\GymClass;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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
            ->when($status === 'active', fn (Builder $q) => $q->where('is_active', true)->whereNull('deleted_at'))
            ->when($status === 'inactive', fn (Builder $q) => $q->where('is_active', false)->whereNull('deleted_at'))
            ->when($status === 'trashed', fn (Builder $q) => $q->whereNotNull('deleted_at'))
            ->when(! $status, fn (Builder $q) => $q->whereNull('deleted_at'))
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
        DB::transaction(fn () => $gymClass->delete());
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