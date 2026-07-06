import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Step1MemberInfo from './registration/Step1MemberInfo';
import Step2SelectPackage from './registration/Step2SelectPackage';
import Step3Payment from './registration/Step3Payment';
import Step4Summary from './registration/Step4Summary';
import type { RegistrationStep1Values } from '@/lib/validations/member-registration';
import type { Member } from '@/types/member';
import type { MembershipPackage } from '@/types/membership-package';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface RegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    packages: MembershipPackage[];
    paymentConfigurations: PaymentConfiguration[];
    existingMember?: Member | null;
}

const NEW_MEMBER_STEPS = ['Data Member', 'Pilih Paket', 'Pembayaran', 'Selesai'];
const ADD_PACKAGE_STEPS = ['Pilih Paket', 'Pembayaran', 'Selesai'];

const EMPTY_MEMBER_INFO: RegistrationStep1Values = {
    name: '',
    phone: '',
};

export default function RegistrationDialog({
    open,
    onOpenChange,
    packages,
    paymentConfigurations,
    existingMember = null,
}: RegistrationDialogProps) {
    const isExistingMember = Boolean(existingMember);
    const stepLabels = isExistingMember ? ADD_PACKAGE_STEPS : NEW_MEMBER_STEPS;
    const firstStep = isExistingMember ? 2 : 1;

    const [step, setStep] = useState(firstStep);
    const [memberInfo, setMemberInfo] = useState<RegistrationStep1Values>(EMPTY_MEMBER_INFO);
    const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const selectedPackages = packages.filter((pkg) => selectedPackageIds.includes(pkg.id));
    const selectedConfig = paymentConfigurations.find((p) => p.id === paymentConfigurationId) ?? null;

    const summaryMemberInfo: RegistrationStep1Values = isExistingMember
        ? { name: existingMember!.name, phone: existingMember!.phone }
        : memberInfo;

    const reset = () => {
        setStep(firstStep);
        setMemberInfo(EMPTY_MEMBER_INFO);
        setSelectedPackageIds([]);
        setPaymentMethod('cash');
        setPaymentConfigurationId(null);
    };

    useEffect(() => {
        if (open) {
            setStep(isExistingMember ? 2 : 1);
        }
    }, [open, isExistingMember, existingMember?.uuid]);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
    };

    const togglePackage = (id: number) => {
        setSelectedPackageIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    const handleSubmit = () => {
        setProcessing(true);
        router.post(
            route('members.register'),
            {
                ...(isExistingMember ? { member_uuid: existingMember!.uuid } : {}),
                member: {
                    name: summaryMemberInfo.name,
                    phone: summaryMemberInfo.phone,
                },
                package_ids: selectedPackageIds,
                payment_method: paymentMethod,
                payment_configuration_id: paymentConfigurationId,
            },
            {
                onSuccess: () => handleOpenChange(false),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const displayStepIndex = isExistingMember ? step - 2 : step - 1;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '640px' }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {isExistingMember ? `Tambah Paket — ${existingMember!.name}` : 'Tambah Member'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between px-1">
                    {stepLabels.map((label, index) => {
                        const isActive = displayStepIndex === index;
                        const isDone = displayStepIndex > index;
                        return (
                            <div key={label} className="flex flex-1 items-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                            isActive || isDone ? 'text-white' : 'bg-gray-100 text-gray-400'
                                        }`}
                                        style={isActive || isDone ? { backgroundColor: 'var(--brand-primary)' } : {}}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className={`hidden text-center text-[10px] sm:block ${isActive ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                {index < stepLabels.length - 1 && (
                                    <div className={`mx-1 h-0.5 flex-1 ${isDone ? '' : 'bg-gray-100'}`} style={isDone ? { backgroundColor: 'var(--brand-primary)' } : {}} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {step === 1 && (
                    <Step1MemberInfo
                        defaultValues={memberInfo}
                        onNext={(data) => {
                            setMemberInfo(data);
                            setStep(2);
                        }}
                    />
                )}

                {step === 2 && (
                    <Step2SelectPackage
                        packages={packages}
                        selectedIds={selectedPackageIds}
                        onToggle={togglePackage}
                        onBack={() => (isExistingMember ? handleOpenChange(false) : setStep(1))}
                        onNext={() => setStep(3)}
                    />
                )}

                {step === 3 && (
                    <Step3Payment
                        selectedPackages={selectedPackages}
                        paymentConfigurations={paymentConfigurations}
                        paymentMethod={paymentMethod}
                        paymentConfigurationId={paymentConfigurationId}
                        onChangeMethod={setPaymentMethod}
                        onChangeConfiguration={setPaymentConfigurationId}
                        onBack={() => setStep(2)}
                        onNext={() => setStep(4)}
                    />
                )}

                {step === 4 && (
                    <Step4Summary
                        memberInfo={summaryMemberInfo}
                        isExistingMember={isExistingMember}
                        selectedPackages={selectedPackages}
                        paymentMethod={paymentMethod}
                        paymentConfiguration={selectedConfig}
                        processing={processing}
                        onBack={() => setStep(3)}
                        onSubmit={handleSubmit}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
