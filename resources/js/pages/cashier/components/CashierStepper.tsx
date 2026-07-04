import { Check } from 'lucide-react';

interface CashierStepperProps {
    step: number;
}

const STEPS = [
    { number: 1, label: 'Pilih Kelas' },
    { number: 2, label: 'Customer' },
    { number: 3, label: 'Pembayaran' },
    { number: 4, label: 'Ringkasan' },
    { number: 5, label: 'Selesai' },
];

export default function CashierStepper({ step }: CashierStepperProps) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            {STEPS.map((s, index) => {
                const isDone = s.number < step;
                const isActive = s.number === step;
                return (
                    <div key={s.number} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                                    isActive || isDone ? 'text-white' : 'bg-gray-100 text-gray-400'
                                }`}
                                style={isActive || isDone ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            >
                                {isDone ? <Check className="h-4 w-4" /> : s.number}
                            </div>
                            <span
                                className={`hidden text-center text-[11px] sm:block ${
                                    isActive ? 'font-semibold text-gray-900' : 'text-gray-400'
                                }`}
                            >
                                {s.label}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div
                                className={`mx-2 h-0.5 flex-1 ${isDone ? '' : 'bg-gray-100'}`}
                                style={isDone ? { backgroundColor: 'var(--brand-primary)' } : {}}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
