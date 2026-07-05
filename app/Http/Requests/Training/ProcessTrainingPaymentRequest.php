<?php

declare(strict_types=1);

namespace App\Http\Requests\Training;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessTrainingPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('training_participants.pay');
    }

    public function rules(): array
    {
        return [
            'payment_method' => ['required', 'in:cash,transfer,qris'],
            'payment_configuration_id' => [
                Rule::requiredIf(fn () => in_array($this->input('payment_method'), ['transfer', 'qris'], true)),
                'nullable',
                'integer',
                Rule::exists('payment_configurations', 'id')->whereNull('deleted_at'),
            ],
        ];
    }
}
