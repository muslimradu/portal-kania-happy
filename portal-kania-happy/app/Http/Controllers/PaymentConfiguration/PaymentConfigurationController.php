<?php

declare(strict_types=1);

namespace App\Http\Controllers\PaymentConfiguration;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentConfiguration\StoreQrisRequest;
use App\Http\Requests\PaymentConfiguration\StoreTransferRequest;
use App\Models\PaymentConfiguration;
use App\Services\ActivityLogService;
use App\Services\PaymentConfigurationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentConfigurationController extends Controller
{
    public function __construct(
        private readonly PaymentConfigurationService $paymentService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('payment-configurations/Index', [
            'qrisList'     => $this->paymentService->getQris(),
            'transferList' => $this->paymentService->getTransfer(),
            'activeTab'    => $request->string('tab', 'qris')->toString(),
        ]);
    }

    public function storeQris(StoreQrisRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('qris_image_file')) {
            $data['qris_image_file'] = $request->file('qris_image_file');
        }

        $payment = $this->paymentService->createQris($data);

        $this->activityLogService->log(
            module: 'payment_configurations',
            action: 'create',
            description: "Menambahkan QRIS: {$payment->name}",
        );

        return back()->with('success', "QRIS {$payment->name} berhasil ditambahkan.");
    }

    public function updateQris(StoreQrisRequest $request, PaymentConfiguration $paymentConfiguration): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('qris_image_file')) {
            $data['qris_image_file'] = $request->file('qris_image_file');
        }

        $payment = $this->paymentService->updateQris($paymentConfiguration, $data);

        $this->activityLogService->log(
            module: 'payment_configurations',
            action: 'update',
            description: "Mengubah QRIS: {$payment->name}",
        );

        return back()->with('success', "QRIS {$payment->name} berhasil diperbarui.");
    }

    public function storeTransfer(StoreTransferRequest $request): RedirectResponse
    {
        $payment = $this->paymentService->createTransfer($request->validated());

        $this->activityLogService->log(
            module: 'payment_configurations',
            action: 'create',
            description: "Menambahkan transfer: {$payment->name}",
        );

        return back()->with('success', "Rekening {$payment->name} berhasil ditambahkan.");
    }

    public function updateTransfer(StoreTransferRequest $request, PaymentConfiguration $paymentConfiguration): RedirectResponse
    {
        $payment = $this->paymentService->updateTransfer($paymentConfiguration, $request->validated());

        $this->activityLogService->log(
            module: 'payment_configurations',
            action: 'update',
            description: "Mengubah transfer: {$payment->name}",
        );

        return back()->with('success', "Rekening {$payment->name} berhasil diperbarui.");
    }

    public function destroy(PaymentConfiguration $paymentConfiguration): RedirectResponse
    {
        $name = $paymentConfiguration->name;
        $this->paymentService->delete($paymentConfiguration);

        $this->activityLogService->log(
            module: 'payment_configurations',
            action: 'delete',
            description: "Menghapus payment: {$name}",
        );

        return back()->with('success', "{$name} berhasil dihapus.");
    }

    public function restore(string $uuid): RedirectResponse
    {
        $payment = $this->paymentService->restore($uuid);

        $this->activityLogService->log(
            module: 'payment_configurations',
            action: 'restore',
            description: "Memulihkan payment: {$payment->name}",
        );

        return back()->with('success', "{$payment->name} berhasil dipulihkan.");
    }

    public function activateQris(PaymentConfiguration $paymentConfiguration): RedirectResponse
    {
        $this->paymentService->activateQris($paymentConfiguration);

        return back()->with('success', "QRIS {$paymentConfiguration->name} diaktifkan.");
    }
}
