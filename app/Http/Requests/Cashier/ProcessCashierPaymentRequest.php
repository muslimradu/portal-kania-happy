<?php

declare(strict_types=1);

namespace App\Http\Requests\Cashier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessCashierPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('cashier.transaction');
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
