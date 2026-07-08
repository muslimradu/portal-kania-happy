<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingParticipantPayment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TrainingParticipantService
{
    public function __construct(
        private readonly MemberService $memberService,
        private readonly InvoiceService $invoiceService,
    ) {}

    public function paginate(
        ?string $search = null,
        ?string $paymentStatus = null,
        ?string $trainingUuid = null,
        ?string $trainingDate = null,
        string $status = '',
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
        int $perPage = 10,
    ): LengthAwarePaginator {
        $allowedSort = ['full_name', 'phone', 'payment_status', 'created_at', 'paid_at'];
        $sortBy = in_array($sortBy, $allowedSort, true) ? $sortBy : 'created_at';
        $sortDir = $sortDir === 'asc' ? 'asc' : 'desc';

        return TrainingParticipant::withTrashed()
            ->with([
                'training:id,uuid,title,trainer_name,training_dates,price',
            ])
            ->search($search)
            ->paymentStatus($paymentStatus)
            ->selectedTrainingDate($trainingDate)
            ->when($trainingUuid, fn (Builder $q) => $q->whereHas(
                'training',
                fn (Builder $tq) => $tq->where('uuid', $trainingUuid)
            ))
            ->when($status === 'trashed', fn (Builder $q) => $q->whereNotNull('deleted_at'))
            ->when($status !== 'trashed', fn (Builder $q) => $q->whereNull('deleted_at'))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findByUuid(string $uuid): TrainingParticipant
    {
        return TrainingParticipant::withTrashed()
            ->with([
                'training',
                'paymentConfiguration',
                'payments.paymentConfiguration',
                'payments.recorder:id,name',
            ])
            ->where('uuid', $uuid)
            ->firstOrFail();
    }

    public function register(array $data): TrainingParticipant
    {
        return DB::transaction(function () use ($data) {
            $training = Training::query()
                ->whereNull('deleted_at')
                ->where('uuid', $data['training_uuid'])
                ->firstOrFail();

            if (! $training->isRegisterable()) {
                throw new RuntimeException('Pelatihan sudah selesai, pendaftaran ditutup.');
            }

            $paymentMethod = $data['payment_method'];
            $invoiceNumber = $this->invoiceService->generateTrainingInvoiceNumber();
            $selectedDates = $this->normalizeSelectedDates(
                $data['selected_training_dates'] ?? [],
                $training->training_dates ?? [],
            );

            $participant = TrainingParticipant::create([
                'training_id' => $training->id,
                'full_name' => $data['full_name'],
                'phone' => $this->memberService->normalizePhone($data['phone']),
                'payment_status' => $paymentMethod === 'pay_later' ? 'pay_later' : 'unpaid',
                'payment_method' => $paymentMethod,
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'invoice_number' => $invoiceNumber,
                'amount' => $training->price,
                'selected_training_dates' => $selectedDates,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            if (in_array($paymentMethod, ['cash', 'transfer', 'qris'], true)) {
                $this->processPayment($participant, [
                    'payment_method' => $paymentMethod,
                    'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                ]);
            }

            return $participant->fresh(['training']);
        });
    }

    public function processPayment(TrainingParticipant $participant, array $data): TrainingParticipant
    {
        return DB::transaction(function () use ($participant, $data) {
            if ($participant->payment_status === 'paid') {
                throw new RuntimeException('Peserta ini sudah lunas.');
            }

            $participant->loadMissing('training');
            $training = $participant->training;

            $financialTransaction = FinancialTransaction::create([
                'training_participant_id' => $participant->id,
                'type' => 'income',
                'category' => 'training',
                'amount' => $participant->amount,
                'payment_method' => $data['payment_method'],
                'description' => "Pelatihan: {$participant->full_name} - {$training->title} (Invoice {$participant->invoice_number})",
                'transaction_date' => now()->toDateString(),
                'created_by' => auth()->id(),
            ]);

            TrainingParticipantPayment::create([
                'training_participant_id' => $participant->id,
                'invoice_number' => $participant->invoice_number,
                'amount' => $participant->amount,
                'payment_method' => $data['payment_method'],
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'financial_transaction_id' => $financialTransaction->id,
                'paid_at' => now(),
                'recorded_by' => auth()->id(),
            ]);

            $participant->update([
                'payment_status' => 'paid',
                'payment_method' => $data['payment_method'],
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'paid_at' => now(),
                'updated_by' => auth()->id(),
            ]);

            return $participant->fresh(['training']);
        });
    }

    public function delete(TrainingParticipant $participant): void
    {
        $participant->delete();
    }

    public function restore(string $uuid): TrainingParticipant
    {
        $participant = TrainingParticipant::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $participant->restore());

        return $participant;
    }

    /**
     * @param  array<int, string>  $selected
     * @param  array<int, string>  $available
     * @return array<int, string>
     */
    private function normalizeSelectedDates(array $selected, array $available): array
    {
        $available = array_values(array_unique(array_filter($available)));
        sort($available);

        $selected = array_values(array_unique(array_filter($selected)));
        sort($selected);

        if ($selected !== []) {
            return array_values(array_intersect($selected, $available));
        }

        return $available;
    }
}
