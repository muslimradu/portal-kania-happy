import { AlertTriangle } from 'lucide-react';

interface QuotaExhaustedAlertProps {
    message?: string;
}

export default function QuotaExhaustedAlert({ message }: QuotaExhaustedAlertProps) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
                <p className="text-sm font-semibold text-red-700">Kuota habis</p>
                <p className="mt-0.5 text-sm text-red-600">
                    {message ?? 'Member tidak memiliki sisa kuota untuk kelas ini. Sarankan membeli paket baru.'}
                </p>
            </div>
        </div>
    );
}
