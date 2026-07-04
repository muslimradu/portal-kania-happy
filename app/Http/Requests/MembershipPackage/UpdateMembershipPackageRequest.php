<?php

declare(strict_types=1);

namespace App\Http\Requests\MembershipPackage;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('membership_packages.update');
    }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:100'],
            'price'            => ['required', 'numeric', 'min:0'],
            'description'      => ['nullable', 'string', 'max:500'],
            'expired_duration' => ['nullable', 'integer', 'min:1', 'required_unless:expired_type,manual'],
            'expired_type'     => ['required', 'in:days,weeks,months,years,manual'],
            'is_active'        => ['boolean'],
            'details'                        => ['required', 'array', 'min:1'],
            'details.*.gym_class_id'         => ['required', 'exists:gym_classes,id'],
            'details.*.quota'                => ['nullable', 'integer', 'min:1'],
            'details.*.is_unlimited'         => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'              => 'Nama paket wajib diisi.',
            'price.required'             => 'Harga wajib diisi.',
            'price.min'                  => 'Harga tidak boleh negatif.',
            'expired_type.required'      => 'Tipe expired wajib dipilih.',
            'expired_duration.required_unless' => 'Durasi wajib diisi jika tipe bukan Manual.',
            'details.required'           => 'Minimal satu kelas gym wajib ditambahkan.',
            'details.min'                => 'Minimal satu kelas gym wajib ditambahkan.',
            'details.*.gym_class_id.required' => 'Kelas gym wajib dipilih.',
            'details.*.gym_class_id.exists'   => 'Kelas gym tidak valid.',
            'details.*.quota.min'        => 'Kuota minimal 1.',
        ];
    }
}
