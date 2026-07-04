<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudioBookingStatusLog extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'studio_booking_id',
        'field',
        'from_value',
        'to_value',
        'note',
        'changed_by',
    ];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function studioBooking(): BelongsTo
    {
        return $this->belongsTo(StudioBooking::class);
    }
}
