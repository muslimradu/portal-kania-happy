<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasUuids;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'is_public',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    protected static function booted(): void
    {
        static::saved(function (Setting $setting) {
            Cache::forget("setting:{$setting->key}");
        });

        static::deleted(function (Setting $setting) {
            Cache::forget("setting:{$setting->key}");
        });
    }

    public function getTypedValue(): mixed
    {
        return match($this->type) {
            'boolean' => (bool) $this->value,
            'integer' => (int) $this->value,
            'float'   => (float) $this->value,
            'json'    => json_decode($this->value, true),
            default   => $this->value,
        };
    }
}