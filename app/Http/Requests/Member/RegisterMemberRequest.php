<?php

declare(strict_types=1);

namespace App\Http\Requests\Member;

use App\Services\MemberService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('members.create') && $this->user()->can('memberships.create');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('member.phone')) {
            $this->merge([
                'member' => [
                    ...$this->input('member', []),
                    'phone' => app(MemberService::class)->normalizePhone((string) $this->input('member.phone')),
                ],
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'member.name'       => ['required', 'string', 'max:100'],
            'member.phone'      => ['required', 'string', 'max:20', 'regex:/^628[0-9]{6,15}$/', 'unique:members,phone'],
            'member.gender'     => ['nullable', 'in:male,female'],
            'member.birth_date' => ['nullable', 'date', 'before:today'],
            'member.address'    => ['nullable', 'string', 'max:500'],
            'member.notes'      => ['nullable', 'string', 'max:500'],

            'package_ids'   => ['required', 'array', 'min:1'],
            'package_ids.*' => ['required', 'integer', 'exists:membership_packages,id'],

            'payment_method' => ['required', Rule::in(['cash', 'transfer', 'qris'])],
            'payment_configuration_id' => [
                'nullable',
                'integer',
                'required_if:payment_method,transfer,qris',
                'exists:payment_configurations,id',
            ],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'member.name.required'  => 'Nama member wajib diisi.',
            'member.phone.required' => 'Nomor telepon wajib diisi.',
            'member.phone.regex'    => 'Nomor telepon harus diawali 628 dan berupa angka.',
            'member.phone.unique'   => 'Nomor telepon sudah digunakan.',
            'package_ids.required'  => 'Pilih minimal satu paket membership.',
            'package_ids.min'       => 'Pilih minimal satu paket membership.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_configuration_id.required_if' => 'Pilih rekening/QRIS tujuan pembayaran.',
        ];
    }
}
