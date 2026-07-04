<?php

declare(strict_types=1);

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGeneralSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.update');
    }

    public function rules(): array
    {
        return [
            'app_name'         => ['required', 'string', 'max:100'],
            'app_tagline'      => ['required', 'string', 'max:200'],
            'app_timezone'     => ['required', 'string', 'timezone'],
            'app_currency'     => ['required', 'string', 'max:10'],
            'app_date_format'  => ['required', 'string', 'max:20'],
            'app_phone_prefix' => ['required', 'string', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'app_name.required'         => 'Nama aplikasi wajib diisi.',
            'app_tagline.required'      => 'Tagline wajib diisi.',
            'app_timezone.required'     => 'Timezone wajib dipilih.',
            'app_timezone.timezone'     => 'Timezone tidak valid.',
            'app_currency.required'     => 'Mata uang wajib diisi.',
            'app_date_format.required'  => 'Format tanggal wajib diisi.',
            'app_phone_prefix.required' => 'Prefix telepon wajib diisi.',
        ];
    }
}