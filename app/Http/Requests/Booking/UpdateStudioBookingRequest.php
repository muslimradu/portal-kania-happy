<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use App\Services\MemberService;
use App\Services\StudioBookingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateStudioBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('studio_bookings.update');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('customer_phone') && $this->input('customer_phone')) {
            $this->merge([
                'customer_phone' => app(MemberService::class)->normalizePhone((string) $this->input('customer_phone')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:20', 'regex:/^628[0-9]{6,15}$/'],
            'booking_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'customer_phone.required' => 'Nomor telepon wajib diisi.',
            'customer_phone.regex' => 'Nomor telepon harus diawali 08 atau 628 dan berupa angka.',
            'booking_date.required' => 'Tanggal booking wajib diisi.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->has('booking_date') || $validator->errors()->has('start_time') || $validator->errors()->has('end_time')) {
                return;
            }

            /** @var \App\Models\StudioBooking $booking */
            $booking = $this->route('studio_booking');

            $hasConflict = app(StudioBookingService::class)->hasConflict(
                $this->input('booking_date'),
                $this->input('start_time'),
                $this->input('end_time'),
                $booking?->id,
            );

            if ($hasConflict) {
                $validator->errors()->add('schedule', 'Jadwal ini sudah dibooking.');
            }
        });
    }
}
