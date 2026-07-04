<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasUuids;

    protected $fillable = [
        'member_id',
        'gym_class_id',
        'class_name',
        'membership_id',
        'membership_detail_id',
        'package_name',
        'quota_before',
        'quota_after',
        'is_unlimited',
        'checked_in_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_unlimited' => 'boolean',
            'quota_before' => 'integer',
            'quota_after' => 'integer',
            'checked_in_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function gymClass(): BelongsTo
    {
        return $this->belongsTo(GymClass::class);
    }

    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    public function membershipDetail(): BelongsTo
    {
        return $this->belongsTo(MembershipDetail::class);
    }
}
