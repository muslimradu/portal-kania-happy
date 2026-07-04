<?php

declare(strict_types=1);

namespace App\Http\Requests\Member;

use App\Services\MemberService;
use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('members.create');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => app(MemberService::class)->normalizePhone((string) $this->input('phone')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'phone'      => ['required', 'string', 'max:20', 'regex:/^628[0-9]{6,15}$/', 'unique:members,phone'],
            'gender'     => ['nullable', 'in:male,female'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'address'    => ['nullable', 'string', 'max:500'],
            'notes'      => ['nullable', 'string', 'max:500'],
            'is_active'  => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Nama wajib diisi.',
            'phone.required'    => 'Nomor telepon wajib diisi.',
            'phone.regex'       => 'Nomor telepon harus diawali 628 dan berupa angka.',
            'phone.unique'      => 'Nomor telepon sudah digunakan.',
            'gender.in'         => 'Gender tidak valid.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
        ];
    }
}
