<?php

declare(strict_types=1);

namespace App\Http\Requests\Training;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('trainings.update');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'trainer_name' => ['required', 'string', 'max:255'],
            'training_dates' => ['required', 'array', 'min:1'],
            'training_dates.*' => ['required', 'date'],
            'training_location' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:draft,published,closed'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul pelatihan wajib diisi.',
            'trainer_name.required' => 'Trainer wajib diisi.',
            'training_dates.required' => 'Minimal satu tanggal pelatihan wajib diisi.',
            'training_dates.min' => 'Minimal satu tanggal pelatihan wajib diisi.',
            'price.min' => 'Harga tidak boleh negatif.',
        ];
    }
}
