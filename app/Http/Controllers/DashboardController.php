<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use AuthorizesPermissions;

    public function index(DashboardService $dashboardService): Response
    {
        $this->authorizePermission('dashboard.view');

        return Inertia::render('Dashboard', [
            'stats' => $dashboardService->stats(),
            'recent_activity' => $dashboardService->recentActivity(),
            'upcoming_expired_members' => $dashboardService->upcomingExpiredMembers(),
            'recent_bookings' => $dashboardService->recentBookings(),
            'revenue_last_7_days' => $dashboardService->revenueLast7Days(),
            'top_classes' => $dashboardService->topClasses(),
            'payment_distribution' => $dashboardService->paymentDistribution(),
        ]);
    }
}
