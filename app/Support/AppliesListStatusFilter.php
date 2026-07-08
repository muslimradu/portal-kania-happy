<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

final class AppliesListStatusFilter
{
    public static function apply(Builder $query, ?string $status): Builder
    {
        return $query
            ->when($status === 'active', fn (Builder $q) => $q->where('is_active', true)->whereNull('deleted_at'))
            ->when($status === 'inactive', fn (Builder $q) => $q->where('is_active', false)->whereNull('deleted_at'))
            ->when($status === 'trashed', fn (Builder $q) => $q->whereNotNull('deleted_at'))
            ->when(! $status, fn (Builder $q) => $q->whereNull('deleted_at'));
    }
}
