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
        'class_name',
        'quota',
        'quota_used',
        'is_unlimited',
    ];

    protected function casts(): array
    {
        return [
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

    public function remainingQuota(): ?int
    {
        if ($this->is_unlimited) {
            return null;
        }

        return max(0, ($this->quota ?? 0) - $this->quota_used);
    }
}
