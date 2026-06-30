<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasUuids;

    public $timestamps = true;
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'module',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'properties',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
