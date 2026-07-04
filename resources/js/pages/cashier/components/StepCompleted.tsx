import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CashierResult } from '@/types/cashier';

interface StepCompletedProps {
    result: CashierResult;
    onReset: () => void;
}

export default function StepCompleted({ result, onReset }: StepCompletedProps) {
    useEffect(() => {
        const timeout = setTimeout(() => onReset(), 2000);
        return () => clearTimeout(timeout);
    }, [onReset]);

    const isCheckIn = result.type === 'checkin';

    return (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {isCheckIn ? 'Check-in Berhasil' : 'Transaksi Berhasil'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    {isCheckIn
                        ? `${result.member_name} berhasil check-in di kelas ${result.class_name}.`
                        : `Transaksi untuk ${result.customer_name} pada kelas ${result.class_name} telah selesai.`}
                </p>
            </div>

            {result.invoice_number && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Invoice</p>
                    <p className="font-mono text-lg font-semibold text-gray-900">{result.invoice_number}</p>
                </div>
            )}

            <Button
                type="button"
                onClick={onReset}
                className="mt-2 rounded-xl px-8"
                style={{ backgroundColor: 'var(--brand-primary)' }}
            >
                Transaksi Baru
            </Button>

            <p className="text-xs text-gray-400">Halaman akan otomatis kembali dalam beberapa detik...</p>
        </div>
    );
}
