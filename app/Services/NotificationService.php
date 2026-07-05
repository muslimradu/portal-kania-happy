<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Membership;
use App\Models\StudioBooking;
use App\Models\Training;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Carbon;

class NotificationService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function forUser(?Authenticatable $user): array
    {
        if (! $user) {
            return [];
        }

        $today = Carbon::today();
        $tomorrow = $today->copy()->addDay();
        $notifications = [];

        if ($user->can('trainings.view')) {
            $notifications = array_merge($notifications, $this->trainingNotifications($today, $tomorrow));
        }

        if ($user->can('studio_bookings.view')) {
            $notifications = array_merge($notifications, $this->bookingNotifications($today, $tomorrow));
        }

        if ($user->can('members.view')) {
            $notifications = array_merge($notifications, $this->membershipNotifications($today));
        }

        usort($notifications, function (array $a, array $b): int {
            $priority = $a['priority'] <=> $b['priority'];

            return $priority !== 0 ? $priority : strcmp($a['date'], $b['date']);
        });

        return $notifications;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function trainingNotifications(Carbon $today, Carbon $tomorrow): array
    {
        $targets = [
            $today->toDateString() => ['badge' => 'Hari H', 'priority' => 0],
            $tomorrow->toDateString() => ['badge' => 'H-1', 'priority' => 1],
        ];

        $notifications = [];

        Training::query()
            ->whereNull('deleted_at')
            ->get(['uuid', 'title', 'trainer_name', 'training_dates'])
            ->each(function (Training $training) use ($targets, &$notifications) {
                foreach ($training->training_dates ?? [] as $date) {
                    if (! isset($targets[$date])) {
                        continue;
                    }

                    $meta = $targets[$date];
                    $formattedDate = Carbon::parse($date)->translatedFormat('d F Y');

                    $notifications[] = [
                        'id' => "training-{$training->uuid}-{$date}",
                        'type' => 'training',
                        'title' => $training->title,
                        'message' => "Pelatihan {$meta['badge']} · {$formattedDate}",
                        'subtitle' => $training->trainer_name,
                        'href' => route('trainings.show', $training->uuid),
                        'badge' => $meta['badge'],
                        'date' => $date,
                        'priority' => $meta['priority'],
                    ];
                }
            });

        return $notifications;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function bookingNotifications(Carbon $today, Carbon $tomorrow): array
    {
        $targets = [
            $today->toDateString() => ['badge' => 'Hari H', 'priority' => 0],
            $tomorrow->toDateString() => ['badge' => 'H-1', 'priority' => 1],
        ];

        return StudioBooking::query()
            ->whereNull('deleted_at')
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($today, $tomorrow) {
                $query->whereDate('booking_date', $today)
                    ->orWhereDate('booking_date', $tomorrow);
            })
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get(['uuid', 'customer_name', 'booking_date', 'start_time', 'end_time'])
            ->map(function (StudioBooking $booking) use ($targets) {
                $date = $booking->booking_date->toDateString();
                $meta = $targets[$date];
                $formattedDate = $booking->booking_date->translatedFormat('d F Y');
                $time = substr((string) $booking->start_time, 0, 5).' - '.substr((string) $booking->end_time, 0, 5);

                return [
                    'id' => "booking-{$booking->uuid}-{$date}",
                    'type' => 'booking',
                    'title' => $booking->customer_name,
                    'message' => "Booking sanggar {$meta['badge']} · {$formattedDate} · {$time}",
                    'subtitle' => null,
                    'href' => route('bookings.index'),
                    'badge' => $meta['badge'],
                    'date' => $date,
                    'priority' => $meta['priority'],
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function membershipNotifications(Carbon $today): array
    {
        $h3 = $today->copy()->addDays(3);
        $h7 = $today->copy()->addDays(7);

        $targets = [
            $today->toDateString() => ['badge' => 'Hari H', 'priority' => 0],
            $h3->toDateString() => ['badge' => 'H-3', 'priority' => 2],
            $h7->toDateString() => ['badge' => 'H-7', 'priority' => 3],
        ];

        return Membership::query()
            ->with('member:id,uuid,name')
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('end_date')
            ->where(function ($query) use ($today, $h3, $h7) {
                $query->whereDate('end_date', $today)
                    ->orWhereDate('end_date', $h3)
                    ->orWhereDate('end_date', $h7);
            })
            ->orderBy('end_date')
            ->get()
            ->map(function (Membership $membership) use ($targets) {
                $date = $membership->end_date->toDateString();
                $meta = $targets[$date];
                $formattedDate = $membership->end_date->translatedFormat('d F Y');
                $memberName = $membership->member?->name ?? 'Member';

                return [
                    'id' => "membership-{$membership->uuid}-{$date}",
                    'type' => 'membership',
                    'title' => $memberName,
                    'message' => "Membership {$meta['badge']} · {$formattedDate}",
                    'subtitle' => $membership->package_name,
                    'href' => route('members.index'),
                    'badge' => $meta['badge'],
                    'date' => $date,
                    'priority' => $meta['priority'],
                ];
            })
            ->all();
    }
}
