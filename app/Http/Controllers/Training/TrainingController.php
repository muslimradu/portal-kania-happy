<?php

declare(strict_types=1);

namespace App\Http\Controllers\Training;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Training\StoreTrainingRequest;
use App\Http\Requests\Training\UpdateTrainingRequest;
use App\Models\Training;
use App\Services\ActivityLogService;
use App\Services\ExportService;
use App\Services\TrainingParticipantService;
use App\Services\TrainingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TrainingController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly TrainingService $trainingService,
        private readonly TrainingParticipantService $participantService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizePermission('trainings.view');

        return Inertia::render('trainings/Index', [
            'trainings' => $this->trainingService->paginate(
                search: $request->string('search')->toString() ?: null,
                status: $request->string('status')->toString() ?: null,
                sortBy: $request->string('sort_by', 'created_at')->toString(),
                sortDir: $request->string('sort_dir', 'desc')->toString(),
                perPage: $request->integer('per_page', 10),
            ),
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function show(Request $request, Training $training): Response
    {
        $this->authorizePermission('trainings.view');

        $training = $this->trainingService->findByUuid($training->uuid);

        return Inertia::render('trainings/Show', [
            'training' => $training,
            'participants' => $this->participantService->paginate(
                search: $request->string('search')->toString() ?: null,
                paymentStatus: $request->string('payment_status')->toString() ?: null,
                trainingUuid: $training->uuid,
                trainingDate: $request->string('training_date')->toString() ?: null,
                sortBy: $request->string('sort_by', 'created_at')->toString(),
                sortDir: $request->string('sort_dir', 'desc')->toString(),
                perPage: $request->integer('per_page', 10),
            ),
            'filters' => $request->only(['search', 'payment_status', 'training_date', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function store(StoreTrainingRequest $request): RedirectResponse
    {
        $training = $this->trainingService->create($request->validated());

        $this->activityLogService->log(
            module: 'trainings',
            action: 'create',
            description: "Membuat pelatihan: {$training->title}",
            properties: $training->toArray(),
        );

        return back()->with('success', "Pelatihan {$training->title} berhasil ditambahkan.");
    }

    public function update(UpdateTrainingRequest $request, Training $training): RedirectResponse
    {
        $training = $this->trainingService->update($training, $request->validated());

        $this->activityLogService->log(
            module: 'trainings',
            action: 'update',
            description: "Mengubah pelatihan: {$training->title}",
            properties: $training->toArray(),
        );

        return back()->with('success', "Pelatihan {$training->title} berhasil diperbarui.");
    }

    public function destroy(Training $training): RedirectResponse
    {
        $title = $training->title;
        $this->trainingService->delete($training);

        $this->activityLogService->log(
            module: 'trainings',
            action: 'delete',
            description: "Menghapus pelatihan: {$title}",
        );

        return back()->with('success', "Pelatihan {$title} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $training = $this->trainingService->restore($uuid);

        $this->activityLogService->log(
            module: 'trainings',
            action: 'restore',
            description: "Memulihkan pelatihan: {$training->title}",
        );

        return back()->with('success', "Pelatihan {$training->title} berhasil dipulihkan.");
    }

    public function export(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('trainings.export'), 403);

        $this->activityLogService->log('trainings', 'export', 'Mengekspor master data pelatihan', $request);

        return app(ExportService::class)->exportTrainings();
    }
}
