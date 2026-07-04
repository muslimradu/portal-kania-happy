<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Carbon;

class ReportDateRange
{
    /**
     * Resolve a [from, to] Carbon date pair from a preset keyword or explicit custom range.
     *
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    public static function resolve(?string $preset, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $today = Carbon::today();

        return match ($preset) {
            'today' => [$today->copy()->startOfDay(), $today->copy()->endOfDay()],
            'yesterday' => [$today->copy()->subDay()->startOfDay(), $today->copy()->subDay()->endOfDay()],
            'this_week' => [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()->endOfDay()],
            'this_month' => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()->endOfDay()],
            'custom' => [
                $dateFrom ? Carbon::parse($dateFrom)->startOfDay() : null,
                $dateTo ? Carbon::parse($dateTo)->endOfDay() : null,
            ],
            default => [null, null],
        };
    }
}
