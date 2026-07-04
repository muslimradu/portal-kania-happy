<?php

declare(strict_types=1);

namespace App\Http\Controllers\Membership;

use App\Http\Controllers\Controller;
use App\Http\Requests\Membership\UpdateMembershipQuotaRequest;
use App\Models\Membership;
use App\Services\ActivityLogService;
use App\Services\MembershipService;
use Illuminate\Http\RedirectResponse;

class MembershipController extends Controller
{
    public function __construct(
        private readonly MembershipService $membershipService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function updateQuota(UpdateMembershipQuotaRequest $request, Membership $membership): RedirectResponse
    {
        $membership = $this->membershipService->updateQuota($membership, $request->validated()['details']);

        $this->activityLogService->log(
            module: 'memberships',
            action: 'update',
            description: "Mengubah kuota membership: {$membership->package_name} milik {$membership->member?->name}",
        );

        return back()->with('success', "Kuota membership {$membership->package_name} berhasil diperbarui.");
    }
}
