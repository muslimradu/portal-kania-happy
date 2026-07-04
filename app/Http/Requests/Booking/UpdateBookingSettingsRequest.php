<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.update');
    }

    public function rules(): array
    {
        return [
            'booking_price_per_hour' => ['required', 'numeric', 'min:0'],
            'booking_operating_start' => ['required', 'date_format:H:i'],
            'booking_operating_end' => ['required', 'date_format:H:i', 'after:booking_operating_start'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_price_per_hour.required' => 'Harga per jam wajib diisi.',
            'booking_operating_start.required' => 'Jam buka wajib diisi.',
            'booking_operating_end.required' => 'Jam tutup wajib diisi.',
            'booking_operating_end.after' => 'Jam tutup harus setelah jam buka.',
        ];
    }
}
