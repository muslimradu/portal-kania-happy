import { useState } from 'react';
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
import type { MembershipPackage } from '@/types/membership-package';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface RegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    packages: MembershipPackage[];
    paymentConfigurations: PaymentConfiguration[];
}

const STEP_LABELS = ['Member Information', 'Select Package', 'Payment', 'Complete'];

const EMPTY_MEMBER_INFO: RegistrationStep1Values = {
    name: '',
    phone: '',
    address: '',
    birth_date: null,
    notes: '',
};

export default function RegistrationDialog({ open, onOpenChange, packages, paymentConfigurations }: RegistrationDialogProps) {
    const [step, setStep] = useState(1);
    const [memberInfo, setMemberInfo] = useState<RegistrationStep1Values>(EMPTY_MEMBER_INFO);
    const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const selectedPackages = packages.filter((pkg) => selectedPackageIds.includes(pkg.id));
    const selectedConfig = paymentConfigurations.find((p) => p.id === paymentConfigurationId) ?? null;

    const reset = () => {
        setStep(1);
        setMemberInfo(EMPTY_MEMBER_INFO);
        setSelectedPackageIds([]);
        setPaymentMethod('cash');
        setPaymentConfigurationId(null);
    };

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
                member: {
                    name: memberInfo.name,
                    phone: memberInfo.phone,
                    address: memberInfo.address || null,
                    birth_date: memberInfo.birth_date || null,
                    notes: memberInfo.notes || null,
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '640px' }}
            >
                <DialogHeader>
                    <DialogTitle>Daftarkan Member Baru</DialogTitle>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-between px-1">
                    {STEP_LABELS.map((label, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === step;
                        const isDone = stepNumber < step;
                        return (
                            <div key={label} className="flex flex-1 items-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                            isActive || isDone ? 'text-white' : 'bg-gray-100 text-gray-400'
                                        }`}
                                        style={isActive || isDone ? { backgroundColor: 'var(--brand-primary)' } : {}}
                                    >
                                        {stepNumber}
                                    </div>
                                    <span className={`hidden text-center text-[10px] sm:block ${isActive ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                {stepNumber < STEP_LABELS.length && (
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
                        onBack={() => setStep(1)}
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
                        memberInfo={memberInfo}
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
