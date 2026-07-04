import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Step1CustomerInfo from './Step1CustomerInfo';
import Step2Schedule from './Step2Schedule';
import Step3Payment from './Step3Payment';
import Step4Confirmation from './Step4Confirmation';
import { todayDateInputValue } from '../../bookingHelpers';
import type { BookingStep1Values, BookingStep2Values } from '@/lib/validations/booking';
import type { BookingSettings, PaymentMethod } from '@/types/booking';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface BookingFormWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentConfigurations: PaymentConfiguration[];
    bookingSettings: BookingSettings;
    prefill?: Partial<BookingStep2Values>;
}

const STEP_LABELS = ['Pelanggan', 'Jadwal', 'Pembayaran', 'Konfirmasi'];

const EMPTY_CUSTOMER: BookingStep1Values = { customer_name: '', customer_phone: '', notes: '' };

export default function BookingFormWizard({ open, onOpenChange, paymentConfigurations, bookingSettings, prefill }: BookingFormWizardProps) {
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState<BookingStep1Values>(EMPTY_CUSTOMER);
    const [schedule, setSchedule] = useState<BookingStep2Values>({
        booking_date: prefill?.booking_date ?? todayDateInputValue(),
        start_time: prefill?.start_time ?? '',
        end_time: prefill?.end_time ?? '',
    });
    const [duration, setDuration] = useState(0);
    const [price, setPrice] = useState(0);
    const [payNow, setPayNow] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const selectedConfig = paymentConfigurations.find((p) => p.id === paymentConfigurationId) ?? null;

    const reset = () => {
        setStep(1);
        setCustomerInfo(EMPTY_CUSTOMER);
        setSchedule({
            booking_date: prefill?.booking_date ?? todayDateInputValue(),
            start_time: prefill?.start_time ?? '',
            end_time: prefill?.end_time ?? '',
        });
        setDuration(0);
        setPrice(0);
        setPayNow(true);
        setPaymentMethod('cash');
        setPaymentConfigurationId(null);
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
    };

    const handleSubmit = () => {
        setProcessing(true);
        router.post(
            route('bookings.store'),
            {
                customer_name: customerInfo.customer_name,
                customer_phone: customerInfo.customer_phone,
                notes: customerInfo.notes || null,
                booking_date: schedule.booking_date,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                pay_now: payNow,
                payment_method: payNow ? paymentMethod : null,
                payment_configuration_id: payNow ? paymentConfigurationId : null,
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
                    <DialogTitle>Booking Sanggar Baru</DialogTitle>
                </DialogHeader>

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
                    <Step1CustomerInfo
                        defaultValues={customerInfo}
                        onNext={(data) => {
                            setCustomerInfo(data);
                            setStep(2);
                        }}
                    />
                )}

                {step === 2 && (
                    <Step2Schedule
                        defaultValues={schedule}
                        bookingSettings={bookingSettings}
                        onBack={() => setStep(1)}
                        onNext={(data, computedPrice, computedDuration) => {
                            setSchedule(data);
                            setPrice(computedPrice);
                            setDuration(computedDuration);
                            setStep(3);
                        }}
                    />
                )}

                {step === 3 && (
                    <Step3Payment
                        price={price}
                        paymentConfigurations={paymentConfigurations}
                        payNow={payNow}
                        paymentMethod={paymentMethod}
                        paymentConfigurationId={paymentConfigurationId}
                        onChangePayNow={setPayNow}
                        onChangeMethod={setPaymentMethod}
                        onChangeConfiguration={setPaymentConfigurationId}
                        onBack={() => setStep(2)}
                        onNext={() => setStep(4)}
                    />
                )}

                {step === 4 && (
                    <Step4Confirmation
                        customerInfo={customerInfo}
                        schedule={schedule}
                        duration={duration}
                        price={price}
                        payNow={payNow}
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
