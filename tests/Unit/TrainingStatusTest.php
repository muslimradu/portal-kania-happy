<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Training;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TrainingStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_is_upcoming_before_first_date(): void
    {
        Carbon::setTestNow('2026-06-01');

        $training = new Training([
            'training_dates' => ['2026-06-06', '2026-06-07'],
            'first_training_date' => '2026-06-06',
            'last_training_date' => '2026-06-07',
        ]);

        $this->assertSame('upcoming', $training->computeNaturalStatus());
    }

    public function test_status_is_ongoing_between_first_and_last_date(): void
    {
        Carbon::setTestNow('2026-06-10');

        $training = new Training([
            'training_dates' => ['2026-06-06', '2026-06-07', '2026-06-13', '2026-06-14'],
            'first_training_date' => '2026-06-06',
            'last_training_date' => '2026-06-14',
        ]);

        $this->assertSame('ongoing', $training->computeNaturalStatus());
    }

    public function test_status_is_completed_after_last_date(): void
    {
        Carbon::setTestNow('2026-06-15');

        $training = new Training([
            'training_dates' => ['2026-06-06', '2026-06-14'],
            'first_training_date' => '2026-06-06',
            'last_training_date' => '2026-06-14',
        ]);

        $this->assertSame('completed', $training->computeNaturalStatus());
    }
}
