<?php

declare(strict_types=1);

namespace App\Http\Controllers\MembershipPackage;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipPackage\StoreMembershipPackageRequest;
use App\Http\Requests\MembershipPackage\UpdateMembershipPackageRequest;
use App\Models\MembershipPackage;
use App\Services\ActivityLogService;
use App\Services\GymClassService;
use App\Services\MembershipPackageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MembershipPackageController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly MembershipPackageService $packageService,
        private readonly GymClassService $gymClassService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizePermission('membership_packages.view');

        $packages = $this->packageService->paginate(
            search:  $request->string('search')->toString(),
            status:  $request->string('status')->toString(),
            sortBy:  $request->string('sort_by', 'created_at')->toString(),
            sortDir: $request->string('sort_dir', 'desc')->toString(),
            perPage: $request->integer('per_page', 10),
        );

        return Inertia::render('membership-packages/Index', [
            'packages'   => $packages,
            'gymClasses' => $this->gymClassService->getAll(),
            'filters'    => $request->only(['search', 'status', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function store(StoreMembershipPackageRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $details   = $validated['details'] ?? [];
        unset($validated['details']);

        $package = $this->packageService->create($validated, $details);

        $this->activityLogService->log(
            module: 'membership_packages',
            action: 'create',
            description: "Membuat paket membership: {$package->name}",
        );

        return back()->with('success', "Paket {$package->name} berhasil ditambahkan.");
    }

    public function update(UpdateMembershipPackageRequest $request, MembershipPackage $membershipPackage): RedirectResponse
    {
        $validated = $request->validated();
        $details   = $validated['details'] ?? [];
        unset($validated['details']);

        $package = $this->packageService->update($membershipPackage, $validated, $details);

        $this->activityLogService->log(
            module: 'membership_packages',
            action: 'update',
            description: "Mengubah paket membership: {$package->name}",
        );

        return back()->with('success', "Paket {$package->name} berhasil diperbarui.");
    }

    public function destroy(MembershipPackage $membershipPackage): RedirectResponse
    {
        $name = $membershipPackage->name;
        $this->packageService->delete($membershipPackage);

        $this->activityLogService->log(
            module: 'membership_packages',
            action: 'delete',
            description: "Menghapus paket membership: {$name}",
        );

        return back()->with('success', "Paket {$name} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $package = $this->packageService->restore($uuid);

        $this->activityLogService->log(
            module: 'membership_packages',
            action: 'restore',
            description: "Memulihkan paket membership: {$package->name}",
        );

        return back()->with('success', "Paket {$package->name} berhasil dipulihkan.");
    }
}
