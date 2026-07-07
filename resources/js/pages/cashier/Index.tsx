import { useCallback, useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/AppLayout';
import CashierStepper from './components/CashierStepper';
import Step1SelectGymClass from './components/Step1SelectGymClass';
import Step2Customer from './components/Step2Customer';
import Step3Payment from './components/Step3Payment';
import Step4Summary from './components/Step4Summary';
import StepCompleted from './components/StepCompleted';
import TodayAttendancePanel from './components/TodayAttendancePanel';
import type {
    CashierGymClass,
    CashierMember,
    CashierPaymentMethod,
    CashierResult,
    CustomerType,
    EligibilityResult,
    NonMemberInfo,
    TodayAttendanceRow,
} from '@/types/cashier';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface Props {
    gymClasses: CashierGymClass[];
    paymentConfigurations: PaymentConfiguration[];
    todayAttendance: TodayAttendanceRow[];
}

const EMPTY_NON_MEMBER: NonMemberInfo = { name: '', phone: '' };

export default function CashierIndex({ gymClasses, paymentConfigurations, todayAttendance }: Props) {
    const { props: pageProps } = usePage();
    const flash = (pageProps as any).flash as { cashierResult?: CashierResult | null } | undefined;
    const errors = (pageProps as any).errors as Record<string, string> | undefined;

    const [step, setStep] = useState(1);
    const [selectedGymClass, setSelectedGymClass] = useState<CashierGymClass | null>(null);
    const [customerType, setCustomerType] = useState<CustomerType | null>(null);
    const [nonMemberInfo, setNonMemberInfo] = useState<NonMemberInfo>(EMPTY_NON_MEMBER);
    const [selectedMember, setSelectedMember] = useState<CashierMember | null>(null);
    const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
    const [eligibilityLoading, setEligibilityLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<CashierPaymentMethod>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<CashierResult | null>(null);

    const quotaError = errors?.quota ?? null;

    useEffect(() => {
        const cashierResult = flash?.cashierResult;
        if (cashierResult) {
            setResult(cashierResult);
            setStep(5);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.cashierResult]);

    useEffect(() => {
        if (customerType !== 'member' || !selectedMember || !selectedGymClass) {
            setEligibility(null);
            return;
        }

        setEligibilityLoading(true);
        axios
            .post(route('cashier.eligibility'), {
                member_uuid: selectedMember.uuid,
                gym_class_uuid: selectedGymClass.uuid,
            })
            .then((res) => setEligibility(res.data))
            .finally(() => setEligibilityLoading(false));
    }, [customerType, selectedMember, selectedGymClass]);

    const resetWizard = useCallback(() => {
        setStep(1);
        setSelectedGymClass(null);
        setCustomerType(null);
        setNonMemberInfo(EMPTY_NON_MEMBER);
        setSelectedMember(null);
        setEligibility(null);
        setPaymentMethod('cash');
        setPaymentConfigurationId(null);
        setResult(null);
    }, []);

    const startNewTransaction = useCallback(() => {
        setCustomerType(null);
        setNonMemberInfo(EMPTY_NON_MEMBER);
        setSelectedMember(null);
        setEligibility(null);
        setPaymentMethod('cash');
        setPaymentConfigurationId(null);
        setResult(null);
        setStep(2);
    }, []);

    const canGoStep2 = Boolean(selectedGymClass);
    const canGoStep3 =
        customerType === 'non_member'
            ? nonMemberInfo.name.trim().length > 0
            : customerType === 'member'
              ? Boolean(selectedMember) && Boolean(eligibility?.eligible)
              : false;
    const canGoStep4 =
        customerType === 'member' ||
        paymentMethod === 'cash' ||
        paymentMethod === 'pay_later' ||
        paymentConfigurationId !== null;

    const handleSubmit = useCallback(() => {
        if (!selectedGymClass || !customerType || processing) return;

        setProcessing(true);

        if (customerType === 'member' && selectedMember) {
            router.post(
                route('cashier.check-in'),
                {
                    member_uuid: selectedMember.uuid,
                    gym_class_uuid: selectedGymClass.uuid,
                },
                {
                    preserveScroll: true,
                    onFinish: () => setProcessing(false),
                },
            );
        } else {
            router.post(
                route('cashier.transactions.store'),
                {
                    gym_class_uuid: selectedGymClass.uuid,
                    customer_name: nonMemberInfo.name,
                    customer_phone: nonMemberInfo.phone || null,
                    payment_method: paymentMethod,
                    payment_configuration_id: paymentMethod === 'pay_later' ? null : paymentConfigurationId,
                },
                {
                    preserveScroll: true,
                    onFinish: () => setProcessing(false),
                },
            );
        }
    }, [selectedGymClass, customerType, selectedMember, nonMemberInfo, paymentMethod, paymentConfigurationId, processing]);

    // Keyboard shortcuts: Enter = next/complete, Esc = cancel to step 1, Ctrl+K = focus search
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName);

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                document.getElementById('cashier-search')?.focus();
                return;
            }

            if (e.key === 'Escape') {
                if (step > 1 && step < 5) {
                    e.preventDefault();
                    resetWizard();
                }
                return;
            }

            if (e.key === 'Enter' && !isTyping) {
                e.preventDefault();
                if (step === 1 && canGoStep2) setStep(2);
                else if (step === 2 && canGoStep3) setStep(3);
                else if (step === 3 && canGoStep4) setStep(4);
                else if (step === 4 && !processing) handleSubmit();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, canGoStep2, canGoStep3, canGoStep4, processing, handleSubmit, resetWizard]);

    const selectedConfig = paymentConfigurations.find((p) => p.id === paymentConfigurationId) ?? null;

    return (
        <AppLayout breadcrumb={[{ label: 'Kasir' }]}>
            <Head title="Kasir" />

            <div className="mx-auto max-w-7xl space-y-5">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-5">
                        {step < 5 && <CashierStepper step={step} />}

                        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            {step === 1 && (
                                <Step1SelectGymClass
                                    gymClasses={gymClasses}
                                    selected={selectedGymClass}
                                    onSelect={setSelectedGymClass}
                                    onNext={() => canGoStep2 && setStep(2)}
                                />
                            )}

                            {step === 2 && selectedGymClass && (
                                <Step2Customer
                                    gymClass={selectedGymClass}
                                    customerType={customerType}
                                    onChangeCustomerType={(type) => {
                                        setCustomerType(type);
                                        setSelectedMember(null);
                                        setEligibility(null);
                                    }}
                                    nonMemberInfo={nonMemberInfo}
                                    onChangeNonMemberInfo={setNonMemberInfo}
                                    selectedMember={selectedMember}
                                    onSelectMember={setSelectedMember}
                                    eligibility={eligibility}
                                    eligibilityLoading={eligibilityLoading}
                                    onBack={() => setStep(1)}
                                    onNext={() => canGoStep3 && setStep(3)}
                                />
                            )}

                            {step === 3 && selectedGymClass && customerType && (
                                <Step3Payment
                                    gymClass={selectedGymClass}
                                    customerType={customerType}
                                    paymentConfigurations={paymentConfigurations}
                                    paymentMethod={paymentMethod}
                                    paymentConfigurationId={paymentConfigurationId}
                                    onChangeMethod={setPaymentMethod}
                                    onChangeConfiguration={setPaymentConfigurationId}
                                    onBack={() => setStep(2)}
                                    onNext={() => canGoStep4 && setStep(4)}
                                />
                            )}

                            {step === 4 && selectedGymClass && customerType && (
                                <Step4Summary
                                    gymClass={selectedGymClass}
                                    customerType={customerType}
                                    nonMemberInfo={nonMemberInfo}
                                    selectedMember={selectedMember}
                                    paymentMethod={paymentMethod}
                                    paymentConfiguration={selectedConfig}
                                    processing={processing}
                                    quotaError={quotaError}
                                    onBack={() => setStep(3)}
                                    onSubmit={handleSubmit}
                                />
                            )}

                            {step === 5 && result && (
                                <StepCompleted
                                    result={result}
                                    onNewTransaction={startNewTransaction}
                                    onGoHome={resetWizard}
                                />
                            )}
                        </div>
                    </div>

                    <div className="xl:sticky xl:top-6 xl:self-start">
                        <TodayAttendancePanel data={todayAttendance} paymentConfigurations={paymentConfigurations} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
