<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CancelStudioBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('studio_bookings.cancel');
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
