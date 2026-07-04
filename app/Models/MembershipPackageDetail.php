<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipPackageDetail extends Model
{
    use HasUuids;

    protected $fillable = [
        'membership_package_id',
        'gym_class_id',
        'quota',
        'is_unlimited',
    ];

    protected function casts(): array
    {
        return [
            'is_unlimited' => 'boolean',
            'quota'        => 'integer',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function membershipPackage(): BelongsTo
    {
        return $this->belongsTo(MembershipPackage::class);
    }

    public function gymClass(): BelongsTo
    {
        return $this->belongsTo(GymClass::class);
    }
}
