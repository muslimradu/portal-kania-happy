<?php

declare(strict_types=1);

namespace App\Http\Requests\Training;

use App\Models\Training;
use App\Services\MemberService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTrainingParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('training_participants.create');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone') && $this->input('phone')) {
            $this->merge([
                'phone' => app(MemberService::class)->normalizePhone((string) $this->input('phone')),
            ]);
        }

        $training = $this->resolveTraining();

        if (! $training) {
            return;
        }

        $availableDates = $this->sortedDates($training->training_dates ?? []);
        $selected = $this->input('selected_training_dates');

        if (! is_array($selected)) {
            $selected = [];
        }

        $selected = array_values(array_unique(array_filter($selected)));

        if ($availableDates !== [] && $selected === [] && count($availableDates) === 1) {
            $selected = $availableDates;
        }

        $this->merge(['selected_training_dates' => $selected]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'regex:/^628[0-9]{6,15}$/'],
            'training_uuid' => ['required', 'uuid', Rule::exists('trainings', 'uuid')->whereNull('deleted_at')],
            'selected_training_dates' => ['required', 'array', 'min:1'],
            'selected_training_dates.*' => ['required', 'date', 'date_format:Y-m-d'],
            'payment_method' => ['required', 'in:cash,transfer,qris,pay_later'],
            'payment_configuration_id' => [
                Rule::requiredIf(fn () => in_array($this->input('payment_method'), ['transfer', 'qris'], true)),
                'nullable',
                'integer',
                Rule::exists('payment_configurations', 'id')->whereNull('deleted_at'),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $training = $this->resolveTraining();

            if (! $training) {
                return;
            }

            $availableDates = $this->sortedDates($training->training_dates ?? []);
            $selected = $this->sortedDates($this->input('selected_training_dates', []));

            if ($availableDates === []) {
                $validator->errors()->add('selected_training_dates', 'Pelatihan belum memiliki tanggal.');

                return;
            }

            foreach ($selected as $date) {
                if (! in_array($date, $availableDates, true)) {
                    $validator->errors()->add(
                        'selected_training_dates',
                        'Tanggal yang dipilih tidak tersedia pada pelatihan ini.',
                    );

                    return;
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor HP wajib diisi.',
            'phone.regex' => 'Nomor HP harus format 628xxxx.',
            'training_uuid.required' => 'Pelatihan wajib dipilih.',
            'selected_training_dates.required' => 'Pilih minimal satu tanggal pelatihan.',
            'selected_training_dates.min' => 'Pilih minimal satu tanggal pelatihan.',
            'payment_configuration_id.required' => 'Konfigurasi pembayaran wajib dipilih.',
        ];
    }

    private function resolveTraining(): ?Training
    {
        $uuid = $this->input('training_uuid');

        if (! is_string($uuid) || $uuid === '') {
            return null;
        }

        return Training::query()
            ->whereNull('deleted_at')
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * @param  array<int, string>  $dates
     * @return array<int, string>
     */
    private function sortedDates(array $dates): array
    {
        $dates = array_values(array_unique(array_filter($dates)));
        sort($dates);

        return $dates;
    }
}
