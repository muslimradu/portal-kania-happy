<?php

declare(strict_types=1);

namespace App\Http\Controllers\Training;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Training\ProcessTrainingPaymentRequest;
use App\Http\Requests\Training\StoreTrainingParticipantRequest;
use App\Models\PaymentConfiguration;
use App\Models\TrainingParticipant;
use App\Services\ActivityLogService;
use App\Services\ExportService;
use App\Services\TrainingParticipantService;
use App\Services\TrainingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TrainingParticipantController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly TrainingParticipantService $participantService,
        private readonly TrainingService $trainingService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizePermission('training_participants.view');

        return Inertia::render('training-participants/Index', [
            'participants' => $this->participantService->paginate(
                search: $request->string('search')->toString() ?: null,
                paymentStatus: $request->string('payment_status')->toString() ?: null,
                trainingUuid: $request->string('training_uuid')->toString() ?: null,
                status: $request->string('status')->toString(),
                sortBy: $request->string('sort_by', 'created_at')->toString(),
                sortDir: $request->string('sort_dir', 'desc')->toString(),
                perPage: $request->integer('per_page', 10),
            ),
            'filters' => $request->only(['search', 'payment_status', 'training_uuid', 'status', 'sort_by', 'sort_dir', 'per_page']),
            'trainings' => $this->trainingService->registerableOptions(),
            'paymentConfigurations' => PaymentConfiguration::active()->orderBy('name')->get(),
        ]);
    }

    public function show(TrainingParticipant $trainingParticipant): Response
    {
        $this->authorizePermission('training_participants.view');

        return Inertia::render('training-participants/Show', [
            'participant' => $this->participantService->findByUuid($trainingParticipant->uuid),
            'paymentConfigurations' => PaymentConfiguration::active()->orderBy('name')->get(),
        ]);
    }

    public function store(StoreTrainingParticipantRequest $request): RedirectResponse
    {
        try {
            $participant = $this->participantService->register($request->validated());
        } catch (RuntimeException $e) {
            return back()->withErrors(['registration' => $e->getMessage()]);
        }

        $this->activityLogService->log(
            module: 'training_participants',
            action: 'create',
            description: "Mendaftarkan peserta {$participant->full_name} (Invoice {$participant->invoice_number})",
            properties: $participant->toArray(),
        );

        if ($participant->payment_status === 'paid') {
            $this->activityLogService->log(
                module: 'training_participants',
                action: 'payment',
                description: "Pembayaran pelatihan {$participant->full_name} (Invoice {$participant->invoice_number})",
                properties: [
                    'invoice_number' => $participant->invoice_number,
                    'amount' => (string) $participant->amount,
                    'payment_method' => $participant->payment_method,
                ],
            );
        }

        return back()->with('success', "Peserta {$participant->full_name} berhasil didaftarkan. Invoice: {$participant->invoice_number}");
    }

    public function pay(ProcessTrainingPaymentRequest $request, TrainingParticipant $trainingParticipant): RedirectResponse
    {
        try {
            $participant = $this->participantService->processPayment($trainingParticipant, $request->validated());
        } catch (RuntimeException $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }

        $this->activityLogService->log(
            module: 'training_participants',
            action: 'payment',
            description: "Pembayaran pelatihan {$participant->full_name} (Invoice {$participant->invoice_number})",
            properties: [
                'invoice_number' => $participant->invoice_number,
                'amount' => (string) $participant->amount,
                'payment_method' => $participant->payment_method,
            ],
        );

        return back()->with('success', "Pembayaran {$participant->full_name} berhasil. Invoice: {$participant->invoice_number}");
    }

    public function destroy(TrainingParticipant $trainingParticipant): RedirectResponse
    {
        $name = $trainingParticipant->full_name;
        $this->participantService->delete($trainingParticipant);

        $this->activityLogService->log(
            module: 'training_participants',
            action: 'delete',
            description: "Menghapus peserta pelatihan: {$name}",
        );

        return back()->with('success', "Peserta {$name} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $participant = $this->participantService->restore($uuid);

        $this->activityLogService->log(
            module: 'training_participants',
            action: 'restore',
            description: "Memulihkan peserta pelatihan: {$participant->full_name}",
        );

        return back()->with('success', "Peserta {$participant->full_name} berhasil dipulihkan.");
    }

    public function exportParticipants(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('training_participants.export'), 403);

        $this->activityLogService->log('training_participants', 'export', 'Mengekspor daftar peserta pelatihan', $request);

        return app(ExportService::class)->exportTrainingParticipants();
    }

    public function exportPayments(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('training_participants.export'), 403);

        $this->activityLogService->log('training_participants', 'export', 'Mengekspor riwayat pembayaran pelatihan', $request);

        return app(ExportService::class)->exportTrainingPayments();
    }
}
