<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'customer_name',
        'customer_phone',
        'gym_class_id',
        'class_name',
        'payment_configuration_id',
        'payment_method',
        'amount',
        'status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
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

    public function gymClass(): BelongsTo
    {
        return $this->belongsTo(GymClass::class);
    }

    public function paymentConfiguration(): BelongsTo
    {
        return $this->belongsTo(PaymentConfiguration::class);
    }

    public function financialTransaction(): HasOne
    {
        return $this->hasOne(FinancialTransaction::class);
    }

    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('invoice_number', 'like', "%{$search}%");
            });
        }

        return $query;
    }
}
