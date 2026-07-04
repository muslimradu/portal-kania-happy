<?php

declare(strict_types=1);

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandingSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.update');
    }

    public function rules(): array
    {
        return [
            'app_primary_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'app_logo'          => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048', 'dimensions:max_width=2000,max_height=2000'],
            'app_favicon'       => ['nullable', 'image', 'mimes:png,ico', 'max:512', 'dimensions:max_width=512,max_height=512'],
        ];
    }

    public function messages(): array
    {
        return [
            'app_primary_color.required' => 'Warna utama wajib diisi.',
            'app_primary_color.regex'    => 'Format warna tidak valid. Gunakan format hex (#RRGGBB).',
            'app_logo.image'             => 'Logo harus berupa file gambar.',
            'app_logo.mimes'             => 'Logo harus berformat PNG atau JPG.',
            'app_logo.max'               => 'Ukuran logo maksimal 2MB.',
            'app_favicon.image'          => 'Favicon harus berupa file gambar.',
            'app_favicon.mimes'          => 'Favicon harus berformat PNG atau ICO.',
            'app_favicon.max'            => 'Ukuran favicon maksimal 512KB.',
        ];
    }
}