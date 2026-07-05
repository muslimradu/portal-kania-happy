<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingParticipantPayment extends Model
{
    use HasUuids;

    protected $fillable = [
        'training_participant_id',
        'invoice_number',
        'amount',
        'payment_method',
        'payment_configuration_id',
        'financial_transaction_id',
        'paid_at',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(TrainingParticipant::class, 'training_participant_id');
    }

    public function paymentConfiguration(): BelongsTo
    {
        return $this->belongsTo(PaymentConfiguration::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
