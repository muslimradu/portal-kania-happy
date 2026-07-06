<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PaymentConfiguration;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentConfigurationService
{
    public function getQris(): Collection
    {
        return PaymentConfiguration::qris()->withTrashed()->latest()->get();
    }

    public function getTransfer(): Collection
    {
        return PaymentConfiguration::transfer()->withTrashed()->latest()->get();
    }

    public function createQris(array $data): PaymentConfiguration
    {
        return DB::transaction(function () use ($data) {
            $qrisImage = $this->handleQrisImage($data);

            return PaymentConfiguration::create([
                'type'         => 'qris',
                'name'         => $data['name'],
                'qris_type'    => $data['qris_type'],
                'qris_image'   => $qrisImage,
                'qris_url'     => $data['qris_type'] === 'url' ? $data['qris_url'] : null,
                'is_active'    => $data['is_active'] ?? true,
                'created_by'   => auth()->id(),
                'updated_by'   => auth()->id(),
            ]);
        });
    }

    public function createTransfer(array $data): PaymentConfiguration
    {
        return DB::transaction(function () use ($data) {
            return PaymentConfiguration::create([
                'type'           => 'transfer',
                'name'           => $data['name'],
                'bank_name'      => $data['bank_name'],
                'account_number' => $data['account_number'],
                'account_holder' => $data['account_holder'],
                'is_active'      => $data['is_active'] ?? true,
                'created_by'     => auth()->id(),
                'updated_by'     => auth()->id(),
            ]);
        });
    }

    public function updateQris(PaymentConfiguration $payment, array $data): PaymentConfiguration
    {
        return DB::transaction(function () use ($payment, $data) {
            $qrisImage = $this->handleQrisImage($data, $payment);

            $payment->update([
                'name'       => $data['name'],
                'qris_type'  => $data['qris_type'],
                'qris_image' => $qrisImage,
                'qris_url'   => $data['qris_type'] === 'url' ? $data['qris_url'] : null,
                'is_active'  => $data['is_active'] ?? true,
                'updated_by' => auth()->id(),
            ]);

            return $payment->fresh();
        });
    }

    public function updateTransfer(PaymentConfiguration $payment, array $data): PaymentConfiguration
    {
        return DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'name'           => $data['name'],
                'bank_name'      => $data['bank_name'],
                'account_number' => $data['account_number'],
                'account_holder' => $data['account_holder'],
                'is_active'      => $data['is_active'] ?? true,
                'updated_by'     => auth()->id(),
            ]);

            return $payment->fresh();
        });
    }

    public function delete(PaymentConfiguration $payment): void
    {
        DB::transaction(fn () => $payment->delete());
    }

    public function restore(string $uuid): PaymentConfiguration
    {
        $payment = PaymentConfiguration::withTrashed()->where('uuid', $uuid)->firstOrFail();
        DB::transaction(fn () => $payment->restore());
        return $payment;
    }

    public function activateQris(PaymentConfiguration $payment): void
    {
        DB::transaction(function () use ($payment) {
            PaymentConfiguration::qris()->update(['is_active' => false]);
            $payment->update(['is_active' => true]);
        });
    }

    private function handleQrisImage(array $data, ?PaymentConfiguration $existing = null): ?string
    {
        if ($data['qris_type'] === 'upload') {
            if (isset($data['qris_image_file'])) {
                if ($existing?->qris_image) {
                    Storage::disk('public')->delete($existing->qris_image);
                }
                return $data['qris_image_file']->store('payment/qris', 'public');
            }
            return $existing?->qris_image;
        }

        if ($data['qris_type'] === 'url') {
            if ($existing?->qris_image) {
                Storage::disk('public')->delete($existing->qris_image);
            }

            return null;
        }

        return $existing?->qris_image;
    }
}
