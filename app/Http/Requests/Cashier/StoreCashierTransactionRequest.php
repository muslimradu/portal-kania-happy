<?php

declare(strict_types=1);

namespace App\Http\Requests\Cashier;

use App\Services\MemberService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashierTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('cashier.transaction');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('customer_phone') && $this->input('customer_phone')) {
            $this->merge([
                'customer_phone' => app(MemberService::class)->normalizePhone((string) $this->input('customer_phone')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'gym_class_uuid' => ['required', 'string', 'exists:gym_classes,uuid'],
            'customer_name' => ['required', 'string', 'max:100'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'payment_method' => ['required', Rule::in(['cash', 'transfer', 'qris', 'pay_later'])],
            'payment_configuration_id' => [
                'nullable',
                'integer',
                Rule::requiredIf(fn () => in_array($this->input('payment_method'), ['transfer', 'qris'], true)),
                'prohibited_if:payment_method,pay_later',
                Rule::exists('payment_configurations', 'id')->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'gym_class_uuid.required' => 'Pilih kelas gym terlebih dahulu.',
            'gym_class_uuid.exists' => 'Kelas gym tidak ditemukan.',
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_configuration_id.required_if' => 'Pilih rekening/QRIS tujuan pembayaran.',
        ];
    }
}
