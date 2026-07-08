<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipDetail extends Model
{
    use HasUuids;

    protected $fillable = [
        'membership_id',
        'gym_class_id',
        'quota_group',
        'class_name',
        'quota',
        'quota_used',
        'is_unlimited',
    ];

    protected function casts(): array
    {
        return [
            'quota_group'  => 'integer',
            'quota'        => 'integer',
            'quota_used'   => 'integer',
            'is_unlimited' => 'boolean',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    public function gymClass(): BelongsTo
    {
        return $this->belongsTo(GymClass::class);
    }

    public function quotaPool(): self
    {
        if ($this->quota_group === null) {
            return $this;
        }

        $pool = $this->membership?->details
            ->where('quota_group', $this->quota_group)
            ->first(fn (self $detail) => $detail->quota !== null || $detail->is_unlimited);

        return $pool ?? $this;
    }

    public function remainingQuota(): ?int
    {
        $pool = $this->quotaPool();

        if ($pool->is_unlimited) {
            return null;
        }

        return max(0, ($pool->quota ?? 0) - $pool->quota_used);
    }
}
