<?php

declare(strict_types=1);

namespace App\Http\Requests\PaymentConfiguration;

use Illuminate\Foundation\Http\FormRequest;

class StoreQrisRequest extends FormRequest
{
    public function authorize(): bool
    {
        $isEdit = $this->route('paymentConfiguration') !== null;

        return $this->user()->can($isEdit ? 'payment_configurations.update' : 'payment_configurations.create');
    }

    public function rules(): array
    {
        $isEdit = $this->route('paymentConfiguration') !== null;

        return [
            'name'            => ['required', 'string', 'max:100'],
            'qris_type'       => ['required', 'in:upload,url'],
            'qris_image_file' => [
                'nullable',
                'image',
                'mimes:png,jpg,jpeg',
                'max:2048',
                $isEdit ? 'sometimes' : 'required_if:qris_type,upload',
            ],
            'qris_url'        => ['nullable', 'string', 'url', 'required_if:qris_type,url'],
            'is_active'       => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                  => 'Nama QRIS wajib diisi.',
            'qris_type.required'             => 'Tipe QRIS wajib dipilih.',
            'qris_image_file.required_if'    => 'Gambar QRIS wajib diupload.',
            'qris_image_file.image'          => 'File harus berupa gambar.',
            'qris_image_file.max'            => 'Ukuran gambar maksimal 2MB.',
            'qris_url.required_if'           => 'URL QRIS wajib diisi.',
            'qris_url.url'                   => 'Format URL tidak valid.',
        ];
    }
}
