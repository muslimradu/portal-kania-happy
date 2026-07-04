import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, QrCode, Building2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import QrisCard from './components/QrisCard';
import TransferCard from './components/TransferCard';
import QrisFormDialog from './components/QrisFormDialog';
import TransferFormDialog from './components/TransferFormDialog';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface Props {
    qrisList: PaymentConfiguration[];
    transferList: PaymentConfiguration[];
    activeTab: string;
}

export default function PaymentConfigurationIndex({ qrisList, transferList, activeTab: initialTab }: Props) {
    const [tab, setTab] = useState(initialTab);
    const [qrisFormOpen, setQrisFormOpen] = useState(false);
    const [transferFormOpen, setTransferFormOpen] = useState(false);
    const [editQris, setEditQris] = useState<PaymentConfiguration | undefined>();
    const [editTransfer, setEditTransfer] = useState<PaymentConfiguration | undefined>();

    const handleTabChange = (newTab: string) => {
        setTab(newTab);
        router.get(route('payment-configurations.index'), { tab: newTab }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumb={[
            { label: 'Configuration' },
            { label: 'Payment Configuration' },
        ]}>
            <Head title="Payment Configuration" />

            <div className="space-y-6">
                <PageHeader
                    title="Payment Configuration"
                    description="Kelola metode pembayaran yang tersedia di kasir"
                    action={
                        tab === 'qris' ? (
                            <Button
                                onClick={() => { setEditQris(undefined); setQrisFormOpen(true); }}
                                className="rounded-xl"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah QRIS
                            </Button>
                        ) : (
                            <Button
                                onClick={() => { setEditTransfer(undefined); setTransferFormOpen(true); }}
                                className="rounded-xl"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Rekening
                            </Button>
                        )
                    }
                />

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm w-fit">
                    {[
                        { value: 'qris', label: 'QRIS', icon: QrCode },
                        { value: 'transfer', label: 'Transfer', icon: Building2 },
                    ].map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.value}
                                onClick={() => handleTabChange(t.value)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    tab === t.value ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                                style={tab === t.value ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                <Icon className="h-4 w-4" />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* QRIS Tab */}
                {tab === 'qris' && (
                    <div>
                        <div className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            ⚠️ Hanya satu QRIS yang dapat aktif. Klik "Aktifkan" untuk mengganti QRIS aktif.
                        </div>
                        {qrisList.length === 0 ? (
                            <div className="rounded-2xl bg-white shadow-sm">
                                <EmptyState
                                    icon={QrCode}
                                    title="Belum ada QRIS"
                                    description="Tambahkan QRIS untuk menerima pembayaran dari member."
                                    action={{ label: 'Tambah QRIS', onClick: () => setQrisFormOpen(true) }}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {qrisList.map((qris) => (
                                    <QrisCard
                                        key={qris.uuid}
                                        qris={qris}
                                        onEdit={(q) => { setEditQris(q); setQrisFormOpen(true); }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Transfer Tab */}
                {tab === 'transfer' && (
                    <div>
                        <div className="mb-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            ℹ️ Multiple rekening transfer dapat aktif bersamaan dan akan ditampilkan semua di kasir.
                        </div>
                    {transferList.length === 0 ? (
                            <div className="rounded-2xl bg-white shadow-sm">
                                <EmptyState
                                    icon={Building2}
                                    title="Belum ada rekening transfer"
                                    description="Tambahkan rekening bank untuk menerima pembayaran transfer."
                                    action={{ label: 'Tambah Rekening', onClick: () => setTransferFormOpen(true) }}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {transferList.map((transfer) => (
                                    <TransferCard
                                        key={transfer.uuid}
                                        transfer={transfer}
                                        onEdit={(t) => { setEditTransfer(t); setTransferFormOpen(true); }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <QrisFormDialog
                key={editQris?.uuid ?? 'new-qris'}
                open={qrisFormOpen}
                onOpenChange={setQrisFormOpen}
                qris={editQris}
            />

            <TransferFormDialog
                key={editTransfer?.uuid ?? 'new-transfer'}
                open={transferFormOpen}
                onOpenChange={setTransferFormOpen}
                transfer={editTransfer}
            />
        </AppLayout>
    );
}
