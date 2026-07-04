<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\GymActivityReportFilterRequest;
use App\Models\GymClass;
use App\Models\MembershipPackage;
use App\Services\ActivityLogService;
use App\Services\ExportService;
use App\Services\Reports\GymActivityReportService;
use App\Services\Reports\MembershipReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly GymActivityReportService $gymActivityReportService,
        private readonly MembershipReportService $membershipReportService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): RedirectResponse
    {
        if ($request->user()->can('reports.gym_activity.view')) {
            return redirect()->route('reports.gym-activity.index');
        }

        if ($request->user()->can('reports.membership.view')) {
            return redirect()->route('reports.membership.index');
        }

        abort(403);
    }

    public function gymActivity(Request $request): Response
    {
        abort_unless($request->user()->can('reports.gym_activity.view'), 403);

        $filters = $request->only([
            'search', 'gym_class_id', 'payment_method', 'member_status', 'date_preset', 'date_from', 'date_to', 'sort_by', 'sort_dir',
        ]);

        return Inertia::render('reports/GymActivity', [
            'data' => $this->gymActivityReportService->paginate($filters),
            'filters' => $filters,
            'summary' => $this->gymActivityReportService->summary($filters),
            'gymClasses' => GymClass::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function membership(Request $request): Response
    {
        abort_unless($request->user()->can('reports.membership.view'), 403);

        $membershipFilters = $request->only([
            'member_search', 'membership_package_id', 'expired_status', 'm_date_preset', 'm_date_from', 'm_date_to', 'm_sort_by', 'm_sort_dir',
        ]);
        $normalizedMembershipFilters = [
            'search' => $membershipFilters['member_search'] ?? null,
            'membership_package_id' => $membershipFilters['membership_package_id'] ?? null,
            'expired_status' => $membershipFilters['expired_status'] ?? null,
            'date_preset' => $membershipFilters['m_date_preset'] ?? null,
            'date_from' => $membershipFilters['m_date_from'] ?? null,
            'date_to' => $membershipFilters['m_date_to'] ?? null,
            'sort_by' => $membershipFilters['m_sort_by'] ?? null,
            'sort_dir' => $membershipFilters['m_sort_dir'] ?? null,
        ];

        return Inertia::render('reports/Membership', [
            'data' => $this->membershipReportService->paginate($normalizedMembershipFilters),
            'filters' => $membershipFilters,
            'summary' => $this->membershipReportService->summary($normalizedMembershipFilters),
            'membershipPackages' => MembershipPackage::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function exportGymActivity(GymActivityReportFilterRequest $request, ExportService $exportService): StreamedResponse
    {
        abort_unless($request->user()->can('reports.gym_activity.export'), 403);

        $this->activityLogService->log('reports', 'export', 'Mengekspor Laporan Aktivitas Gym', $request);

        return $exportService->exportGymActivityReport($request->filters());
    }

    public function exportMembership(Request $request, ExportService $exportService): StreamedResponse
    {
        abort_unless($request->user()->can('reports.membership.export'), 403);

        $filters = [
            'search' => $request->string('member_search')->toString() ?: null,
            'membership_package_id' => $request->input('membership_package_id'),
            'expired_status' => $request->string('expired_status')->toString() ?: null,
            'date_preset' => $request->string('m_date_preset')->toString() ?: null,
            'date_from' => $request->string('m_date_from')->toString() ?: null,
            'date_to' => $request->string('m_date_to')->toString() ?: null,
        ];

        $this->activityLogService->log('reports', 'export', 'Mengekspor Laporan Membership', $request);

        return $exportService->exportMembershipReport($filters);
    }
}
