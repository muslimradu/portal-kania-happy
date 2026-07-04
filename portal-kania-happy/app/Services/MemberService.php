<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Member;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class MemberService
{
    public function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        } elseif (str_starts_with($phone, '8')) {
            $phone = '62' . $phone;
        }

        return $phone;
    }

    public function paginate(
        ?string $search = null,
        ?string $status = null,
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
        int $perPage = 10,
    ): LengthAwarePaginator {
        return Member::withTrashed()
            ->withCount(['activeMemberships'])
            ->when($search, fn (Builder $q) => $q->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($status === 'active', fn (Builder $q) => $q->where('is_active', true)->whereNull('deleted_at'))
            ->when($status === 'inactive', fn (Builder $q) => $q->where('is_active', false)->whereNull('deleted_at'))
            ->when($status === 'trashed', fn (Builder $q) => $q->whereNotNull('deleted_at'))
            ->when(! $status, fn (Builder $q) => $q->whereNull('deleted_at'))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Member
    {
        return DB::transaction(function () use ($data) {
            $data['phone'] = $this->normalizePhone($data['phone']);

            return Member::create([
                ...$data,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        });
    }

    public function update(Member $member, array $data): Member
    {
        return DB::transaction(function () use ($member, $data) {
            $data['phone'] = $this->normalizePhone($data['phone']);

            $member->update([
                ...$data,
                'updated_by' => auth()->id(),
            ]);

            return $member->fresh();
        });
    }

    public function delete(Member $member): void
    {
        DB::transaction(fn () => $member->delete());
    }

    public function restore(string $uuid): Member
    {
        $member = Member::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $member->restore());
        return $member;
    }

    public function findByUuid(string $uuid): Member
    {
        return Member::withTrashed()->where('uuid', $uuid)->firstOrFail();
    }
}
