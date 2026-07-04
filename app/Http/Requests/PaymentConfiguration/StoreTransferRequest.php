<?php

declare(strict_types=1);

namespace App\Http\Requests\PaymentConfiguration;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        $isEdit = $this->route('paymentConfiguration') !== null;

        return $this->user()->can($isEdit ? 'payment_configurations.update' : 'payment_configurations.create');
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:100'],
            'bank_name'      => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder' => ['required', 'string', 'max:100'],
            'is_active'      => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'Nama wajib diisi.',
            'bank_name.required'      => 'Nama bank wajib diisi.',
            'account_number.required' => 'Nomor rekening wajib diisi.',
            'account_holder.required' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}
