<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use App\Services\MemberService;
use App\Services\StudioBookingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreStudioBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('studio_bookings.create');
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
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:500'],
            'pay_now' => ['nullable', 'boolean'],
            'payment_method' => ['nullable', 'required_if:pay_now,true', Rule::in(['cash', 'transfer', 'qris'])],
            'payment_configuration_id' => [
                'nullable',
                'integer',
                'required_if:payment_method,transfer,qris',
                'exists:payment_configurations,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'customer_phone.required' => 'Nomor telepon wajib diisi.',
            'customer_phone.regex' => 'Nomor telepon harus diawali 08 atau 628 dan berupa angka.',
            'booking_date.required' => 'Tanggal booking wajib diisi.',
            'booking_date.after_or_equal' => 'Tanggal booking tidak boleh di masa lalu.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
            'payment_method.required_if' => 'Pilih metode pembayaran.',
            'payment_configuration_id.required_if' => 'Pilih rekening/QRIS tujuan pembayaran.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->has('booking_date') || $validator->errors()->has('start_time') || $validator->errors()->has('end_time')) {
                return;
            }

            $hasConflict = app(StudioBookingService::class)->hasConflict(
                $this->input('booking_date'),
                $this->input('start_time'),
                $this->input('end_time'),
            );

            if ($hasConflict) {
                $validator->errors()->add('schedule', 'Jadwal ini sudah dibooking.');
            }
        });
    }
}
