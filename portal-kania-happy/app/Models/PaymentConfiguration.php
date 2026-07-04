<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentConfiguration extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'type',
        'name',
        'qris_type',
        'qris_image',
        'qris_url',
        'bank_name',
        'account_number',
        'account_holder',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
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

    public function scopeQris($query)
    {
        return $query->where('type', 'qris');
    }

    public function scopeTransfer($query)
    {
        return $query->where('type', 'transfer');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
