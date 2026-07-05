<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Training extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'trainer_name',
        'training_dates',
        'first_training_date',
        'last_training_date',
        'training_location',
        'price',
        'created_by',
        'updated_by',
    ];

    protected $appends = [
        'status',
    ];

    protected function casts(): array
    {
        return [
            'training_dates' => 'array',
            'first_training_date' => 'date',
            'last_training_date' => 'date',
            'price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Training $training): void {
            $dates = collect($training->training_dates ?? [])
                ->filter()
                ->sort()
                ->values();

            if ($dates->isEmpty()) {
                $training->first_training_date = null;
                $training->last_training_date = null;

                return;
            }

            $training->first_training_date = $dates->first();
            $training->last_training_date = $dates->last();
        });
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function participants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class);
    }

    /**
     * @return 'upcoming'|'ongoing'|'completed'
     */
    public function computeNaturalStatus(): string
    {
        if (! $this->first_training_date) {
            return 'upcoming';
        }

        $today = Carbon::today();
        $start = $this->first_training_date->copy()->startOfDay();
        $end = ($this->last_training_date ?? $this->first_training_date)->copy()->startOfDay();

        if ($today->lt($start)) {
            return 'upcoming';
        }

        if ($today->gt($end)) {
            return 'completed';
        }

        return 'ongoing';
    }

    public function isRegisterable(): bool
    {
        return $this->computeNaturalStatus() !== 'completed';
    }

    protected function status(): Attribute
    {
        return Attribute::get(fn (): string => $this->computeNaturalStatus());
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, fn (Builder $q) => $q->where(function (Builder $q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('trainer_name', 'like', "%{$search}%")
                ->orWhere('training_location', 'like', "%{$search}%");
        }));
    }

    public function scopeComputedStatus(Builder $query, string $status): Builder
    {
        $today = Carbon::today()->toDateString();

        return match ($status) {
            'upcoming' => $query->where('first_training_date', '>', $today),
            'ongoing' => $query
                ->where('first_training_date', '<=', $today)
                ->where('last_training_date', '>=', $today),
            'completed' => $query->where('last_training_date', '<', $today),
            default => $query,
        };
    }
}
