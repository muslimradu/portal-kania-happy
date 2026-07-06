<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPackage;
use App\Models\MemberTimeline;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MemberRegistrationService
{
    public function __construct(
        private readonly MemberService $memberService,
        private readonly InvoiceService $invoiceService,
    ) {}

    /**
     * @return array{member: Member, invoice: Invoice, memberships: Collection<int, Membership>, is_new_member: bool}
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $isNewMember = empty($data['member_uuid']);

            if ($isNewMember) {
                $member = Member::create([
                    'name' => $data['member']['name'],
                    'phone' => $this->memberService->normalizePhone($data['member']['phone']),
                    'gender' => $data['member']['gender'] ?? null,
                    'is_active' => true,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);
            } else {
                $member = Member::where('uuid', $data['member_uuid'])->firstOrFail();
            }

            $packages = MembershipPackage::with('details.gymClass')
                ->whereIn('id', $data['package_ids'])
                ->get();

            $totalAmount = $packages->sum('price');

            $invoice = Invoice::create([
                'invoice_number' => $this->invoiceService->generateInvoiceNumber(),
                'member_id' => $member->id,
                'payment_configuration_id' => $data['payment_configuration_id'] ?? null,
                'payment_method' => $data['payment_method'],
                'total_amount' => $totalAmount,
                'status' => 'paid',
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            FinancialTransaction::create([
                'invoice_id' => $invoice->id,
                'type' => 'income',
                'category' => 'membership',
                'amount' => $totalAmount,
                'payment_method' => $data['payment_method'],
                'description' => $isNewMember
                    ? "Pendaftaran member {$member->name} - Invoice {$invoice->invoice_number}"
                    : "Pembelian membership {$member->name} - Invoice {$invoice->invoice_number}",
                'transaction_date' => Carbon::today(),
                'created_by' => auth()->id(),
            ]);

            $memberships = $packages->map(function (MembershipPackage $package) use ($member, $invoice) {
                $membership = Membership::create([
                    'member_id' => $member->id,
                    'membership_package_id' => $package->id,
                    'invoice_id' => $invoice->id,
                    'package_name' => $package->name,
                    'price' => $package->price,
                    'status' => 'active',
                    'start_date' => null,
                    'end_date' => null,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);

                foreach ($package->details as $detail) {
                    $membership->details()->create([
                        'gym_class_id' => $detail->gym_class_id,
                        'class_name' => $detail->gymClass?->name ?? 'Umum',
                        'quota' => $detail->is_unlimited ? null : $detail->quota,
                        'quota_used' => 0,
                        'is_unlimited' => $detail->is_unlimited,
                    ]);
                }

                MemberTimeline::create([
                    'member_id' => $member->id,
                    'type' => 'purchase',
                    'title' => "Membeli Paket {$package->name}",
                    'description' => "Invoice {$invoice->invoice_number}",
                    'reference_type' => Membership::class,
                    'reference_id' => $membership->id,
                ]);

                return $membership->load('details.gymClass');
            });

            return [
                'member' => $member,
                'invoice' => $invoice,
                'memberships' => $memberships,
                'is_new_member' => $isNewMember,
            ];
        });
    }
}
