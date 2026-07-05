<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingParticipant extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'training_id',
        'full_name',
        'phone',
        'payment_status',
        'payment_method',
        'payment_configuration_id',
        'invoice_number',
        'amount',
        'selected_training_dates',
        'paid_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'selected_training_dates' => 'array',
            'paid_at' => 'datetime',
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

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class);
    }

    public function paymentConfiguration(): BelongsTo
    {
        return $this->belongsTo(PaymentConfiguration::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(TrainingParticipantPayment::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, fn (Builder $q) => $q->where(function (Builder $q) use ($search) {
            $q->where('full_name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('invoice_number', 'like', "%{$search}%");
        }));
    }

    public function scopePaymentStatus(Builder $query, ?string $status): Builder
    {
        return $query->when($status, fn (Builder $q) => $q->where('payment_status', $status));
    }

    public function scopeSelectedTrainingDate(Builder $query, ?string $date): Builder
    {
        return $query->when($date, fn (Builder $q) => $q->whereJsonContains('selected_training_dates', $date));
    }
}
