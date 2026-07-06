import { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CashierPaymentDialog from './CashierPaymentDialog';
import type { TodayAttendanceRow } from '@/types/cashier';
import type { PaymentConfiguration } from '@/types/payment-configuration';

interface TodayAttendancePanelProps {
    data: TodayAttendanceRow[];
    paymentConfigurations: PaymentConfiguration[];
}

type SortKey = 'name' | 'gym_class' | 'member_status' | 'payment_status';

const PER_PAGE = 10;

export default function TodayAttendancePanel({ data, paymentConfigurations }: TodayAttendancePanelProps) {
    const [sortBy, setSortBy] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentRow, setPaymentRow] = useState<TodayAttendanceRow | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    const handleSort = (key: string) => {
        const column = key as SortKey;
        setCurrentPage(1);
        if (sortBy === column) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setSortBy(column);
        setSortDir('asc');
    };

    const openPaymentDialog = (row: TodayAttendanceRow) => {
        setPaymentRow(row);
        setPaymentDialogOpen(true);
    };

    const sortedData = useMemo(() => {
        const rows = [...data];
        rows.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'member_status') {
                comparison = a.member_status.localeCompare(b.member_status);
            } else if (sortBy === 'payment_status') {
                comparison = a.payment_status.localeCompare(b.payment_status);
            } else {
                comparison = a[sortBy].localeCompare(b[sortBy], 'id');
            }

            return sortDir === 'asc' ? comparison : -comparison;
        });

        return rows;
    }, [data, sortBy, sortDir]);

    const lastPage = Math.max(1, Math.ceil(sortedData.length / PER_PAGE));

    useEffect(() => {
        if (currentPage > lastPage) {
            setCurrentPage(lastPage);
        }
    }, [currentPage, lastPage]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * PER_PAGE;
        return sortedData.slice(start, start + PER_PAGE);
    }, [sortedData, currentPage]);

    const from = sortedData.length === 0 ? null : (currentPage - 1) * PER_PAGE + 1;
    const to = sortedData.length === 0 ? null : Math.min(currentPage * PER_PAGE, sortedData.length);

    const columns: Column<TodayAttendanceRow>[] = [
        {
            key: 'name',
            header: 'Nama',
            sortable: true,
            render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
        },
        {
            key: 'gym_class',
            header: 'Senam',
            sortable: true,
        },
        {
            key: 'member_status',
            header: 'Status',
            sortable: true,
            render: (row) => (
                <Badge
                    className="rounded-full text-white"
                    style={{ backgroundColor: row.member_status === 'member' ? 'var(--brand-primary)' : '#9CA3AF' }}
                >
                    {row.member_status === 'member' ? 'Member' : 'Non Member'}
                </Badge>
            ),
        },
        {
            key: 'payment_status',
            header: 'Pembayaran',
            sortable: true,
            render: (row) => {
                if (row.member_status === 'member') {
                    return <span className="text-xs text-gray-400">—</span>;
                }

                return (
                    <Badge
                        className="rounded-full text-white"
                        style={{ backgroundColor: row.payment_status === 'paid' ? '#16a34a' : '#d97706' }}
                    >
                        {row.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                    </Badge>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            render: (row) => {
                if (row.member_status !== 'non_member' || row.payment_status !== 'unpaid') {
                    return null;
                }

                return (
                    <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                        onClick={() => openPaymentDialog(row)}
                    >
                        Bayar
                    </Button>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)', color: 'var(--brand-primary)' }}
                        >
                            <ClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Daftar Hadir Hari Ini</h2>
                            <p className="text-xs text-gray-400">{data.length} kehadiran</p>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto">
                    <DataTable
                        columns={columns}
                        data={paginatedData}
                        keyExtractor={(row) => row.uuid}
                        stickyHeader
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                        emptyTitle="Belum ada kehadiran"
                        emptyDescription="Check-in member dan transaksi non member hari ini akan muncul di sini."
                    />
                </div>

                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    from={from}
                    to={to}
                    total={sortedData.length}
                    summaryFormat="compact"
                    onPageChange={setCurrentPage}
                />
            </div>

            <CashierPaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                row={paymentRow}
                paymentConfigurations={paymentConfigurations}
            />
        </>
    );
}
