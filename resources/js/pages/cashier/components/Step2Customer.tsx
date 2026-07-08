import { ArrowLeft, ArrowRight, Loader2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MemberSearchCombobox from './MemberSearchCombobox';
import MembershipCard from './MembershipCard';
import QuotaExhaustedAlert from './QuotaExhaustedAlert';
import type { CashierGymClass, CashierMember, CustomerType, EligibilityResult, NonMemberInfo } from '@/types/cashier';

interface Step2CustomerProps {
    gymClass: CashierGymClass;
    customerType: CustomerType | null;
    onChangeCustomerType: (type: CustomerType) => void;
    nonMemberInfo: NonMemberInfo;
    onChangeNonMemberInfo: (info: NonMemberInfo) => void;
    selectedMember: CashierMember | null;
    onSelectMember: (member: CashierMember) => void;
    eligibility: EligibilityResult | null;
    eligibilityLoading: boolean;
    onBack: () => void;
    onNext: () => void;
}

export default function Step2Customer({
    gymClass,
    customerType,
    onChangeCustomerType,
    nonMemberInfo,
    onChangeNonMemberInfo,
    selectedMember,
    onSelectMember,
    eligibility,
    eligibilityLoading,
    onBack,
    onNext,
}: Step2CustomerProps) {
    const canProceed =
        customerType === 'non_member'
            ? nonMemberInfo.name.trim().length > 0
            : customerType === 'member'
              ? Boolean(selectedMember) && Boolean(eligibility?.eligible)
              : false;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Data Customer</h2>
                <p className="text-sm text-gray-500">
                    Kelas terpilih: <span className="font-medium" style={{ color: gymClass.color_label }}>{gymClass.name}</span>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => onChangeCustomerType('member')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                        customerType === 'member' ? 'text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={customerType === 'member' ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}
                >
                    <User className="h-4 w-4" /> Member
                </button>
                <button
                    type="button"
                    onClick={() => onChangeCustomerType('non_member')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                        customerType === 'non_member' ? 'text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={customerType === 'non_member' ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}
                >
                    <Users className="h-4 w-4" /> Non Member
                </button>
            </div>

            {customerType === 'non_member' && (
                <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="customer_name">Nama Customer</Label>
                        <Input
                            id="customer_name"
                            autoFocus
                            value={nonMemberInfo.name}
                            onChange={(e) => onChangeNonMemberInfo({ ...nonMemberInfo, name: e.target.value })}
                            placeholder="Masukkan nama customer"
                            className="rounded-xl bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="customer_phone">Nomor Telepon (Opsional)</Label>
                        <Input
                            id="customer_phone"
                            value={nonMemberInfo.phone}
                            onChange={(e) => onChangeNonMemberInfo({ ...nonMemberInfo, phone: e.target.value })}
                            placeholder="08xxxxxxxxxx"
                            className="rounded-xl bg-white"
                        />
                    </div>
                </div>
            )}

            {customerType === 'member' && (
                <div className="space-y-3">
                    <MemberSearchCombobox onSelect={onSelectMember} />

                    {selectedMember && (
                        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: 'var(--brand-primary)' }}
                                >
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedMember.name}</p>
                                    <p className="text-xs text-gray-400">{selectedMember.phone}</p>
                                </div>
                                <span
                                    className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                                    style={{
                                        backgroundColor: (selectedMember.active_memberships ?? []).length > 0 ? '#16a34a' : '#6b7280',
                                    }}
                                >
                                    {(selectedMember.active_memberships ?? []).length > 0 ? 'Membership Aktif' : 'Tanpa Membership'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Membership Aktif</p>
                                {(selectedMember.active_memberships ?? []).length === 0 ? (
                                    <p className="text-sm text-gray-400">Member ini belum memiliki membership aktif.</p>
                                ) : (
                                    (selectedMember.active_memberships ?? []).map((membership) => (
                                        <MembershipCard key={membership.uuid} membership={membership} activeGymClassId={gymClass.id} />
                                    ))
                                )}
                            </div>

                            {eligibilityLoading && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Mengecek kuota...
                                </div>
                            )}

                            {!eligibilityLoading && eligibility && !eligibility.eligible && (
                                <QuotaExhaustedAlert title={eligibility.title} message={eligibility.message} />
                            )}

                            {!eligibilityLoading && eligibility?.eligible && (
                                <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700">
                                    {eligibility.is_unlimited
                                        ? `Kuota unlimited pada paket ${eligibility.package_name ?? ''}.`
                                        : `Kuota tersedia (sisa ${eligibility.remaining_quota}x) pada paket ${eligibility.package_name ?? ''}.`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed}
                    className="flex-1 rounded-xl"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
