<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessBookingPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('studio_bookings.pay');
    }

    public function rules(): array
    {
        return [
            'payment_method' => ['required', Rule::in(['cash', 'transfer', 'qris'])],
            'payment_configuration_id' => [
                'nullable',
                'integer',
                'required_if:payment_method,transfer,qris',
                'exists:payment_configurations,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_configuration_id.required_if' => 'Pilih rekening/QRIS tujuan pembayaran.',
        ];
    }
}
