<?php

declare(strict_types=1);

namespace App\Http\Requests\Cashier;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('cashier.checkin');
    }

    public function rules(): array
    {
        return [
            'member_uuid' => ['required', 'string', 'exists:members,uuid'],
            'gym_class_uuid' => ['required', 'string', 'exists:gym_classes,uuid'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_uuid.required' => 'Pilih member terlebih dahulu.',
            'member_uuid.exists' => 'Member tidak ditemukan.',
            'gym_class_uuid.required' => 'Pilih kelas gym terlebih dahulu.',
            'gym_class_uuid.exists' => 'Kelas gym tidak ditemukan.',
        ];
    }
}
