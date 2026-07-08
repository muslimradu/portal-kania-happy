<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Training;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TrainingService
{
    public function paginate(
        ?string $search = null,
        ?string $status = null,
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
        int $perPage = 10,
    ): LengthAwarePaginator {
        $allowedSort = ['title', 'trainer_name', 'price', 'first_training_date', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSort, true) ? $sortBy : 'created_at';
        $sortDir = $sortDir === 'asc' ? 'asc' : 'desc';

        return Training::withTrashed()
            ->withCount([
                'participants as participants_count' => fn (Builder $q) => $q->whereNull('deleted_at'),
            ])
            ->search($search)
            ->when($status === 'trashed', fn (Builder $q) => $q->whereNotNull('deleted_at'))
            ->when(
                in_array($status, ['upcoming', 'ongoing', 'completed'], true),
                fn (Builder $q) => $q->whereNull('deleted_at')->computedStatus($status)
            )
            ->when(! $status, fn (Builder $q) => $q->whereNull('deleted_at'))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function registerableOptions(): Collection
    {
        $today = Carbon::today()->toDateString();

        return Training::query()
            ->whereNull('deleted_at')
            ->where('last_training_date', '>=', $today)
            ->orderBy('first_training_date')
            ->orderBy('title')
            ->get(['id', 'uuid', 'title', 'price', 'trainer_name', 'training_dates', 'first_training_date', 'last_training_date']);
    }

    public function findByUuid(string $uuid): Training
    {
        return Training::withTrashed()
            ->withCount([
                'participants as participants_count' => fn (Builder $q) => $q->whereNull('deleted_at'),
                'participants as paid_participants_count' => fn (Builder $q) => $q->whereNull('deleted_at')->where('payment_status', 'paid'),
                'participants as unpaid_participants_count' => fn (Builder $q) => $q->whereNull('deleted_at')->where('payment_status', '!=', 'paid'),
            ])
            ->where('uuid', $uuid)
            ->firstOrFail();
    }

    public function create(array $data): Training
    {
        return DB::transaction(function () use ($data) {
            return Training::create([
                ...$data,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        });
    }

    public function update(Training $training, array $data): Training
    {
        return DB::transaction(function () use ($training, $data) {
            $training->update([
                ...$data,
                'updated_by' => auth()->id(),
            ]);

            return $training->fresh();
        });
    }

    public function delete(Training $training): void
    {
        $training->delete();
    }

    public function restore(string $uuid): Training
    {
        $training = Training::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $training->restore());

        return $training;
    }
}
