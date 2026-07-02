<?php

declare(strict_types=1);

namespace App\Http\Requests\GymClass;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGymClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('gym_classes.update');
    }

    public function rules(): array
    {
        $gymClass = $this->route('gym_class');

        return [
            'name'        => ['required', 'string', 'max:100', "unique:gym_classes,name,{$gymClass->id}"],
            'price'       => ['required', 'numeric', 'min:0'],
            'color_label' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon'        => ['required', 'string', 'max:100'],
            'is_active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Nama kelas wajib diisi.',
            'name.unique'          => 'Nama kelas sudah digunakan.',
            'price.required'       => 'Harga wajib diisi.',
            'price.min'            => 'Harga tidak boleh negatif.',
            'color_label.required' => 'Warna label wajib dipilih.',
            'color_label.regex'    => 'Format warna tidak valid.',
            'icon.required'        => 'Icon wajib diisi.',
        ];
    }
}