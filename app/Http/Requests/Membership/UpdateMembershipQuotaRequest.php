<?php

declare(strict_types=1);

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateMembershipQuotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('memberships.update');
    }

    public function rules(): array
    {
        $membership = $this->route('membership');

        return [
            'details'                => ['required', 'array', 'min:1'],
            'details.*.id'           => [
                'required',
                'integer',
                Rule::exists('membership_details', 'id')->where('membership_id', $membership->id),
            ],
            'details.*.is_unlimited' => ['boolean'],
            'details.*.quota'        => ['nullable', 'integer', 'min:0'],
            'details.*.quota_used'   => ['required', 'integer', 'min:0'],

            'start_date'       => ['nullable', 'date'],
            'end_date'         => ['nullable', 'date'],
            'expired_type'     => ['nullable', Rule::in(['manual', 'days', 'weeks', 'months', 'years'])],
            'expired_duration' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'details.required'         => 'Detail kuota wajib diisi.',
            'details.*.quota_used.required' => 'Jumlah pemakaian wajib diisi.',
            'details.*.quota.min'      => 'Total kuota tidak boleh negatif.',
            'details.*.quota_used.min' => 'Pemakaian tidak boleh negatif.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            foreach ($this->input('details', []) as $index => $detail) {
                $isUnlimited = $detail['is_unlimited'] ?? false;
                $quota       = $detail['quota'] ?? null;
                $quotaUsed   = $detail['quota_used'] ?? 0;

                if (! $isUnlimited && $quota !== null && $quotaUsed > $quota) {
                    $validator->errors()->add(
                        "details.{$index}.quota_used",
                        'Pemakaian tidak boleh melebihi total kuota.'
                    );
                }
            }

            $expiredType = $this->input('expired_type');
            if ($expiredType && $expiredType !== 'manual' && ! $this->input('expired_duration')) {
                $validator->errors()->add('expired_duration', 'Durasi masa expired wajib diisi.');
            }

            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');
            if ($startDate && $endDate && Carbon::parse($endDate)->lt(Carbon::parse($startDate))) {
                $validator->errors()->add('end_date', 'Tanggal berakhir tidak boleh sebelum tanggal mulai.');
            }
        });
    }
}
