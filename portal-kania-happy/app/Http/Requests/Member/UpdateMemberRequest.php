<?php

declare(strict_types=1);

namespace App\Http\Requests\Member;

use App\Services\MemberService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('members.update');
    }

    public function rules(): array
    {
        $member      = $this->route('member');
        $service     = app(MemberService::class);
        $normalized  = $service->normalizePhone($this->input('phone', ''));

        return [
            'name'       => ['required', 'string', 'max:100'],
            'phone'      => ['required', 'string', 'max:20', "unique:members,phone,{$member->id}"],
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
            'phone.unique'      => 'Nomor telepon sudah digunakan.',
            'gender.in'         => 'Gender tidak valid.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
        ];
    }
}
