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
use Illuminate\Support\Carbon;

class StudioBooking extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'customer_name',
        'customer_phone',
        'booking_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'price',
        'notes',
        'payment_status',
        'payment_method',
        'payment_configuration_id',
        'invoice_number',
        'paid_at',
        'status',
        'cancelled_at',
        'cancel_reason',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'price' => 'decimal:2',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
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

    public function paymentConfiguration(): BelongsTo
    {
        return $this->belongsTo(PaymentConfiguration::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(StudioBookingPayment::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(StudioBookingStatusLog::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }

    public function scopeNotCancelled(Builder $query): Builder
    {
        return $query->where('status', '!=', 'cancelled');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, fn (Builder $q) => $q->where(function (Builder $q) use ($search) {
            $q->where('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_phone', 'like', "%{$search}%")
                ->orWhere('invoice_number', 'like', "%{$search}%");
        }));
    }

    public function getStartDateTimeAttribute(): Carbon
    {
        return Carbon::parse($this->booking_date->format('Y-m-d') . ' ' . $this->start_time);
    }

    public function getEndDateTimeAttribute(): Carbon
    {
        return Carbon::parse($this->booking_date->format('Y-m-d') . ' ' . $this->end_time);
    }

    /**
     * Determine the natural status of the booking based on the current time,
     * without mutating the stored value. Cancelled bookings are never recomputed.
     */
    public function computeNaturalStatus(): string
    {
        if ($this->status === 'cancelled') {
            return 'cancelled';
        }

        $now = Carbon::now();

        if ($now->lt($this->start_date_time)) {
            return 'upcoming';
        }

        if ($now->between($this->start_date_time, $this->end_date_time)) {
            return 'ongoing';
        }

        return 'completed';
    }
}
