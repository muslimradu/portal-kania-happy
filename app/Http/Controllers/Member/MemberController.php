<?php

declare(strict_types=1);

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreMemberRequest;
use App\Http\Requests\Member\UpdateMemberRequest;
use App\Models\Member;
use App\Models\MembershipPackage;
use App\Models\PaymentConfiguration;
use App\Services\ActivityLogService;
use App\Services\ExportService;
use App\Services\MemberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MemberController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly MemberService $memberService,
        private readonly ActivityLogService $activityLogService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizePermission('members.view');

        $members = $this->memberService->paginate(
            search:  $request->string('search')->toString(),
            status:  $request->string('status')->toString(),
            sortBy:  $request->string('sort_by', 'created_at')->toString(),
            sortDir: $request->string('sort_dir', 'desc')->toString(),
            perPage: $request->integer('per_page', 10),
        );

        return Inertia::render('members/Index', [
            'members' => $members,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_dir', 'per_page']),
            'packages' => MembershipPackage::active()
                ->with('details.gymClass')
                ->orderBy('name')
                ->get(),
            'paymentConfigurations' => PaymentConfiguration::active()
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function show(Member $member): Response
    {
        $member->load([
            'memberships' => fn ($q) => $q->orderByDesc('created_at'),
            'memberships.details.gymClass',
            'invoices' => fn ($q) => $q->orderByDesc('created_at'),
            'invoices.memberships',
            'invoices.paymentConfiguration',
            'timelines' => fn ($q) => $q->orderByDesc('created_at'),
            'attendances' => fn ($q) => $q->orderByDesc('checked_in_at'),
            'attendances.gymClass',
        ]);

        return Inertia::render('members/Show', [
            'member' => $member,
        ]);
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $member = $this->memberService->create($request->validated());

        $this->activityLogService->log(
            module: 'members',
            action: 'create',
            description: "Menambahkan member: {$member->name}",
        );

        return back()->with('success', "Member {$member->name} berhasil ditambahkan.");
    }

    public function update(UpdateMemberRequest $request, Member $member): RedirectResponse
    {
        $member = $this->memberService->update($member, $request->validated());

        $this->activityLogService->log(
            module: 'members',
            action: 'update',
            description: "Mengubah member: {$member->name}",
        );

        return back()->with('success', "Member {$member->name} berhasil diperbarui.");
    }

    public function destroy(Member $member): RedirectResponse
    {
        $name = $member->name;
        $this->memberService->delete($member);

        $this->activityLogService->log(
            module: 'members',
            action: 'delete',
            description: "Menghapus member: {$name}",
        );

        return back()->with('success', "Member {$name} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $member = $this->memberService->restore($uuid);

        $this->activityLogService->log(
            module: 'members',
            action: 'restore',
            description: "Memulihkan member: {$member->name}",
        );

        return back()->with('success', "Member {$member->name} berhasil dipulihkan.");
    }

    public function export(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('members.export'), 403);

        $this->activityLogService->log(
            module: 'members',
            action: 'export',
            description: 'Mengekspor daftar member ke Excel',
        );

        return $this->exportService->exportMembers();
    }

    public function exportMemberships(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('memberships.export'), 403);

        $this->activityLogService->log(
            module: 'memberships',
            action: 'export',
            description: 'Mengekspor data membership ke Excel',
        );

        return $this->exportService->exportMemberships();
    }
}
