<?php

declare(strict_types=1);

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class GymActivityReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'gym_class_id' => ['nullable', 'integer', 'exists:gym_classes,id'],
            'payment_method' => ['nullable', 'in:cash,transfer,qris'],
            'member_status' => ['nullable', 'in:member,non_member'],
            'date_preset' => ['nullable', 'in:today,yesterday,this_week,this_month,custom'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'sort_by' => ['nullable', 'string'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        return $this->validated();
    }
}
