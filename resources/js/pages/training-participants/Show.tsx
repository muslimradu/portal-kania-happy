import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Phone,
    User,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import EmptyState from '@/components/shared/EmptyState';
import PaymentDialog from './components/PaymentDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { TrainingParticipant } from '@/types/training-participant';
import type { PaymentConfiguration } from '@/types/payment-configuration';
import {
    formatCurrency,
    formatDateTime,
    formatTrainingDates,
    normalizePhoneDisplay,
    PAYMENT_METHOD_LABELS,
    PAYMENT_STATUS_LABELS,
    paymentBadgeStyle,
} from '@/pages/trainings/trainingHelpers';

interface Props {
    participant: TrainingParticipant;
    paymentConfigurations: PaymentConfiguration[];
}

export default function TrainingParticipantShow({ participant, paymentConfigurations }: Props) {
    const [payOpen, setPayOpen] = useState(false);

    const canPay = participant.payment_status === 'unpaid' || participant.payment_status === 'pay_later';

    return (
        <AppLayout
            breadcrumb={[
                { label: 'Daftar Pelatihan', href: route('training-participants.index') },
                { label: participant.full_name },
            ]}
        >
            <Head title={participant.full_name} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('training-participants.index')}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{participant.full_name}</h1>
                            <p className="text-sm text-gray-500">{participant.training?.title}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <Badge className="rounded-full text-white" style={paymentBadgeStyle(participant.payment_status)}>
                            {PAYMENT_STATUS_LABELS[participant.payment_status]}
                        </Badge>
                        {canPay && (
                            <Button
                                variant="outline"
                                onClick={() => setPayOpen(true)}
                                className="rounded-xl"
                            >
                                <CreditCard className="mr-2 h-4 w-4" /> Bayar
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="profile">
                    <TabsList variant="line" className="border-b border-gray-100">
                        <TabsTrigger value="profile">Informasi Pribadi</TabsTrigger>
                        <TabsTrigger value="payments">Riwayat Pembayaran</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Nama Lengkap</p>
                                        <p className="text-sm font-medium text-gray-900">{participant.full_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Nomor HP</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {normalizePhoneDisplay(participant.phone)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Pelatihan</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {participant.training?.title ?? '-'}
                                        </p>
                                        {participant.training?.training_dates && (
                                            <p className="text-xs text-gray-500">
                                                Pelatihan: {formatTrainingDates(participant.training.training_dates)}
                                            </p>
                                        )}
                                        {(participant.selected_training_dates?.length ?? 0) > 0 && (
                                            <p className="text-xs font-medium text-gray-700">
                                                Tanggal diikuti: {formatTrainingDates(participant.selected_training_dates!)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Biaya & Invoice</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(participant.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {participant.invoice_number ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="payments" className="mt-4">
                        <div className="rounded-2xl bg-white shadow-sm">
                            {(participant.payments ?? []).length === 0 ? (
                                <EmptyState
                                    icon={CreditCard}
                                    title="Belum ada riwayat pembayaran"
                                    description="Riwayat pembayaran akan muncul setelah transaksi diproses."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Tanggal
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Invoice
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Metode
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Jumlah
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Dicatat Oleh
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(participant.payments ?? []).map((payment) => (
                                                <tr key={payment.uuid} className="border-b border-gray-50">
                                                    <td className="px-4 py-3 text-gray-700">
                                                        {formatDateTime(payment.paid_at)}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                                        {payment.invoice_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">
                                                        {PAYMENT_METHOD_LABELS[
                                                            payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS
                                                        ] ?? payment.payment_method}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {payment.recorder?.name ?? '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <PaymentDialog
                open={payOpen}
                onOpenChange={setPayOpen}
                participant={participant}
                paymentConfigurations={paymentConfigurations}
            />
        </AppLayout>
    );
}
