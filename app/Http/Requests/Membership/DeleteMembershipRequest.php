<?php

declare(strict_types=1);

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class DeleteMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('memberships.delete');
    }

    public function rules(): array
    {
        return [
            'password' => ['required', 'current_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.required' => 'Password wajib diisi.',
            'password.current_password' => 'Password tidak sesuai.',
        ];
    }
}
