<?php

declare(strict_types=1);

namespace App\Http\Controllers\GymClass;

use App\Http\Controllers\Controller;
use App\Http\Requests\GymClass\StoreGymClassRequest;
use App\Http\Requests\GymClass\UpdateGymClassRequest;
use App\Models\GymClass;
use App\Services\ActivityLogService;
use App\Services\GymClassService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GymClassController extends Controller
{
    public function __construct(
        private readonly GymClassService $gymClassService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $gymClasses = $this->gymClassService->paginate(
            search:  $request->string('search')->toString(),
            status:  $request->string('status')->toString(),
            sortBy:  $request->string('sort_by', 'created_at')->toString(),
            sortDir: $request->string('sort_dir', 'desc')->toString(),
            perPage: $request->integer('per_page', 10),
        );

        return Inertia::render('gym-classes/Index', [
            'gymClasses' => $gymClasses,
            'filters'    => $request->only(['search', 'status', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function store(StoreGymClassRequest $request): RedirectResponse
    {
        $gymClass = $this->gymClassService->create($request->validated());

        $this->activityLogService->log(
            module: 'gym_classes',
            action: 'create',
            description: "Membuat kelas gym: {$gymClass->name}",
            properties: $gymClass->toArray(),
        );

        return back()->with('success', "Kelas {$gymClass->name} berhasil ditambahkan.");
    }

    public function update(UpdateGymClassRequest $request, GymClass $gymClass): RedirectResponse
    {
        $gymClass = $this->gymClassService->update($gymClass, $request->validated());

        $this->activityLogService->log(
            module: 'gym_classes',
            action: 'update',
            description: "Mengubah kelas gym: {$gymClass->name}",
            properties: $gymClass->toArray(),
        );

        return back()->with('success', "Kelas {$gymClass->name} berhasil diperbarui.");
    }

    public function destroy(GymClass $gymClass): RedirectResponse
    {
        $name = $gymClass->name;
        $this->gymClassService->delete($gymClass);

        $this->activityLogService->log(
            module: 'gym_classes',
            action: 'delete',
            description: "Menghapus kelas gym: {$name}",
        );

        return back()->with('success', "Kelas {$name} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $gymClass = $this->gymClassService->restore($uuid);

        $this->activityLogService->log(
            module: 'gym_classes',
            action: 'restore',
            description: "Memulihkan kelas gym: {$gymClass->name}",
        );

        return back()->with('success', "Kelas {$gymClass->name} berhasil dipulihkan.");
    }
}