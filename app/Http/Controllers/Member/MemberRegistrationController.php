<?php

declare(strict_types=1);

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\RegisterMemberRequest;
use App\Services\ActivityLogService;
use App\Services\MemberRegistrationService;
use Illuminate\Http\RedirectResponse;

class MemberRegistrationController extends Controller
{
    public function __construct(
        private readonly MemberRegistrationService $registrationService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function store(RegisterMemberRequest $request): RedirectResponse
    {
        $result = $this->registrationService->register($request->validated());

        $member      = $result['member'];
        $invoice     = $result['invoice'];
        $packageNames = $result['memberships']->pluck('package_name')->implode(', ');

        $this->activityLogService->log(
            module: 'members',
            action: 'create',
            description: "Mendaftarkan member baru: {$member->name}",
        );

        $this->activityLogService->log(
            module: 'memberships',
            action: 'purchase',
            description: "Pembelian membership oleh {$member->name}: {$packageNames} (Invoice {$invoice->invoice_number})",
            properties: [
                'invoice_number' => $invoice->invoice_number,
                'total_amount'   => (string) $invoice->total_amount,
                'payment_method' => $invoice->payment_method,
            ],
        );

        return back()->with('success', "Registrasi member {$member->name} berhasil. Invoice: {$invoice->invoice_number}");
    }
}
