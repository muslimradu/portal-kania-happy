import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TrainingPaymentMethodSelector from './TrainingPaymentMethodSelector';
import {
    trainingParticipantFormSchema,
    type TrainingParticipantFormValues,
} from '@/lib/validations/training-participant';
import { formatCurrency, formatDateShort, formatTrainingDates } from '@/pages/trainings/trainingHelpers';
import type { TrainingOption } from '@/types/training';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import type { TrainingPaymentMethod } from '@/types/training-participant';

interface ParticipantFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trainings: TrainingOption[];
    paymentConfigurations: PaymentConfiguration[];
}

function sortedDates(dates: string[] = []): string[] {
    return [...dates].filter(Boolean).sort();
}

export default function ParticipantFormDialog({
    open,
    onOpenChange,
    trainings,
    paymentConfigurations,
}: ParticipantFormDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<TrainingPaymentMethod>('cash');
    const [paymentConfigurationId, setPaymentConfigurationId] = useState<number | null>(null);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [dateError, setDateError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<TrainingParticipantFormValues>({
        resolver: zodResolver(trainingParticipantFormSchema),
        defaultValues: {
            full_name: '',
            phone: '',
            training_uuid: trainings[0]?.uuid ?? '',
            payment_method: 'cash',
            payment_configuration_id: null,
        },
    });

    const trainingUuid = watch('training_uuid');
    const selectedTraining = trainings.find((t) => t.uuid === trainingUuid);
    const availableDates = useMemo(
        () => sortedDates(selectedTraining?.training_dates ?? []),
        [selectedTraining],
    );
    const hasMultipleDates = availableDates.length > 1;

    useEffect(() => {
        if (availableDates.length === 1) {
            setSelectedDates(availableDates);
        } else {
            setSelectedDates([]);
        }
        setDateError(null);
    }, [trainingUuid, availableDates]);

    const canSubmit =
        (paymentMethod === 'cash' ||
            paymentMethod === 'pay_later' ||
            paymentConfigurationId !== null) &&
        (availableDates.length <= 1 || selectedDates.length > 0);

    const toggleDate = (date: string) => {
        setDateError(null);
        setSelectedDates((prev) =>
            prev.includes(date) ? prev.filter((item) => item !== date) : [...prev, date].sort(),
        );
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
            setPaymentMethod('cash');
            setPaymentConfigurationId(null);
            setSelectedDates([]);
            setDateError(null);
        }
        onOpenChange(isOpen);
    };

    const onSubmit = (data: TrainingParticipantFormValues) => {
        if (hasMultipleDates && selectedDates.length === 0) {
            setDateError('Pilih minimal satu tanggal pelatihan.');
            return;
        }

        setProcessing(true);
        router.post(
            route('training-participants.store'),
            {
                ...data,
                payment_method: paymentMethod,
                payment_configuration_id: paymentConfigurationId,
                selected_training_dates: selectedDates,
            },
            {
                onSuccess: () => handleOpenChange(false),
                onError: (formErrors) => {
                    setDateError(formErrors.selected_training_dates ?? null);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '520px' }}
                className="max-h-[90vh] overflow-y-auto"
            >
                <DialogHeader>
                    <DialogTitle>Tambah Peserta Pelatihan</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nama Lengkap</Label>
                        <Input
                            id="full_name"
                            placeholder="Nama lengkap peserta"
                            className="rounded-xl"
                            {...register('full_name')}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-red-600">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Nomor HP</Label>
                        <Input
                            id="phone"
                            placeholder="08xxxxxxxxxx"
                            className="rounded-xl"
                            {...register('phone')}
                        />
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="training_uuid">Pelatihan</Label>
                        <select
                            id="training_uuid"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
                            {...register('training_uuid')}
                        >
                            {trainings.length === 0 ? (
                                <option value="">Tidak ada pelatihan tersedia</option>
                            ) : (
                                trainings.map((training) => (
                                    <option key={training.uuid} value={training.uuid}>
                                        {training.title} — {formatCurrency(training.price)}
                                    </option>
                                ))
                            )}
                        </select>
                        {errors.training_uuid && (
                            <p className="text-sm text-red-600">{errors.training_uuid.message}</p>
                        )}
                    </div>

                    {selectedTraining && (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                            <p className="font-semibold text-gray-900">{selectedTraining.title}</p>
                            <p className="text-gray-500">Trainer: {selectedTraining.trainer_name}</p>
                            {availableDates.length === 1 && (
                                <p className="mt-1 text-gray-500">
                                    Tanggal: {formatTrainingDates(availableDates)}
                                </p>
                            )}
                            <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                                <span className="font-semibold text-gray-900">Biaya Pelatihan</span>
                                <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                                    {formatCurrency(selectedTraining.price)}
                                </span>
                            </div>
                        </div>
                    )}

                    {hasMultipleDates && (
                        <div className="space-y-1.5">
                            <Label className="text-sm">Pilih Tanggal</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {availableDates.map((date) => {
                                    const isSelected = selectedDates.includes(date);

                                    return (
                                        <button
                                            key={date}
                                            type="button"
                                            onClick={() => toggleDate(date)}
                                            className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                                                isSelected
                                                    ? 'border-violet-200 font-medium text-white'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                            style={
                                                isSelected
                                                    ? { backgroundColor: 'var(--brand-primary)' }
                                                    : undefined
                                            }
                                        >
                                            {formatDateShort(date)}
                                        </button>
                                    );
                                })}
                            </div>
                            {dateError && <p className="text-xs text-red-600">{dateError}</p>}
                        </div>
                    )}

                    <TrainingPaymentMethodSelector
                        paymentConfigurations={paymentConfigurations}
                        paymentMethod={paymentMethod}
                        paymentConfigurationId={paymentConfigurationId}
                        onChangeMethod={setPaymentMethod}
                        onChangeConfiguration={setPaymentConfigurationId}
                    />

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !canSubmit || trainings.length === 0}
                            className="rounded-xl"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Daftarkan Peserta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
