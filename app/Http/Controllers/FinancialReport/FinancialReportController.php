<?php

declare(strict_types=1);

namespace App\Http\Controllers\FinancialReport;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use App\Services\ExportService;
use App\Services\Reports\FinancialReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinancialReportController extends Controller
{
    public function __construct(
        private readonly FinancialReportService $financialReportService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('financial_reports.view'), 403);

        $filters = $request->only(['category', 'payment_method', 'date_preset', 'date_from', 'date_to', 'sort_by', 'sort_dir']);

        return Inertia::render('financial-reports/Index', [
            'transactions' => $this->financialReportService->paginate($filters),
            'filters' => $filters,
            'summary' => $this->financialReportService->summary($filters),
            'periodComparison' => $this->financialReportService->periodComparison(),
        ]);
    }

    public function export(Request $request, ExportService $exportService): StreamedResponse
    {
        abort_unless($request->user()->can('financial_reports.export'), 403);

        $filters = $request->only(['category', 'payment_method', 'date_preset', 'date_from', 'date_to']);

        $this->activityLogService->log('financial_reports', 'export', 'Mengekspor Laporan Keuangan', $request);

        return $exportService->exportFinancialReport($filters);
    }
}
