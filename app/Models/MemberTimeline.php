<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberTimeline extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'member_id',
        'type',
        'title',
        'description',
        'reference_type',
        'reference_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (MemberTimeline $timeline) {
            $timeline->created_at ??= now();
        });
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
