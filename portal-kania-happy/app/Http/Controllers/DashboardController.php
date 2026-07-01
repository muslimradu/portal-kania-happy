<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'total_members'    => 0,
                'expired_members'  => 0,
                'today_classes'    => 0,
                'today_bookings'   => 0,
                'today_revenue'    => 0,
                'monthly_revenue'  => 0,
            ],
            'recent_activity'          => [],
            'upcoming_expired_members' => [],
            'recent_bookings'          => [],
        ]);
    }
}