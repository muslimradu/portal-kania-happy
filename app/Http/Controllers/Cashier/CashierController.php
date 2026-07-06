<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Concerns\AuthorizesPermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\ProcessCashierPaymentRequest;
use App\Http\Requests\Cashier\StoreCashierTransactionRequest;
use App\Http\Requests\Cashier\StoreCheckInRequest;
use App\Models\GymClass;
use App\Models\Member;
use App\Models\PaymentConfiguration;
use App\Models\Transaction;
use App\Services\CashierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CashierController extends Controller
{
    use AuthorizesPermissions;

    public function __construct(
        private readonly CashierService $cashierService,
    ) {}

    public function index(): Response
    {
        $this->authorizePermission('cashier.view');

        $today = now()->toDateString();

        $gymClasses = GymClass::active()
            ->withCount([
                'attendances' => fn ($q) => $q->whereDate('checked_in_at', $today),
                'transactions' => fn ($q) => $q->whereDate('created_at', $today)->whereIn('status', ['paid', 'unpaid']),
            ])
            ->orderBy('name')
            ->get()
            ->each(function (GymClass $gymClass) {
                $gymClass->attendances_count = $gymClass->attendances_count + $gymClass->transactions_count;
            });

        $paymentConfigurations = PaymentConfiguration::active()
            ->orderBy('name')
            ->get();

        return Inertia::render('cashier/Index', [
            'gymClasses' => $gymClasses,
            'paymentConfigurations' => $paymentConfigurations,
            'todayAttendance' => $this->cashierService->todayAttendanceList(),
        ]);
    }

    public function searchMembers(Request $request): JsonResponse
    {
        $this->authorizePermission('cashier.view');

        $search = $request->string('q')->toString();

        if (strlen($search) < 2) {
            return response()->json(['data' => []]);
        }

        $members = $this->cashierService->searchMembers($search);

        return response()->json(['data' => $members]);
    }

    public function eligibility(Request $request): JsonResponse
    {
        $this->authorizePermission('cashier.checkin');

        $request->validate([
            'member_uuid' => ['required', 'string', 'exists:members,uuid'],
            'gym_class_uuid' => ['required', 'string', 'exists:gym_classes,uuid'],
        ]);

        $member = Member::where('uuid', $request->string('member_uuid'))->firstOrFail();
        $gymClass = GymClass::where('uuid', $request->string('gym_class_uuid'))->firstOrFail();

        $detail = $this->cashierService->resolveEligibleDetail($member, $gymClass);

        if (! $detail) {
            return response()->json([
                'eligible' => false,
                'message' => 'Kuota habis. Silakan beli paket baru.',
            ]);
        }

        return response()->json([
            'eligible' => true,
            'is_unlimited' => $detail->is_unlimited,
            'remaining_quota' => $detail->remainingQuota(),
            'package_name' => $detail->membership->package_name ?? null,
        ]);
    }

    public function checkIn(StoreCheckInRequest $request): RedirectResponse
    {
        $member = Member::where('uuid', $request->validated('member_uuid'))->firstOrFail();
        $gymClass = GymClass::where('uuid', $request->validated('gym_class_uuid'))->firstOrFail();

        try {
            $attendance = $this->cashierService->checkIn($member, $gymClass);
        } catch (RuntimeException $e) {
            return back()->withErrors(['quota' => $e->getMessage()]);
        }

        return back()->with('success', 'Check-in completed successfully.')->with('cashierResult', [
            'type' => 'checkin',
            'invoice_number' => null,
            'member_name' => $member->name,
            'class_name' => $gymClass->name,
            'checked_in_at' => $attendance->checked_in_at,
        ]);
    }

    public function store(StoreCashierTransactionRequest $request): RedirectResponse
    {
        $transaction = $this->cashierService->checkoutNonMember($request->validated());
        $isPayLater = $transaction->status === 'unpaid';

        return back()->with('success', $isPayLater ? 'Transaksi bayar nanti berhasil dicatat.' : 'Transaction completed successfully.')->with('cashierResult', [
            'type' => 'transaction',
            'invoice_number' => $transaction->invoice_number,
            'customer_name' => $transaction->customer_name,
            'class_name' => $transaction->class_name,
            'amount' => $transaction->amount,
            'pay_later' => $isPayLater,
        ]);
    }

    public function pay(ProcessCashierPaymentRequest $request, Transaction $transaction): RedirectResponse
    {
        try {
            $this->cashierService->processPayment($transaction, $request->validated());
        } catch (RuntimeException $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }

        return back()->with('success', 'Pembayaran berhasil diproses.');
    }
}
