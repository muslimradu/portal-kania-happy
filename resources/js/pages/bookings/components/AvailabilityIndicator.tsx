import { CircleDot } from 'lucide-react';
import type { AvailabilitySegment } from '@/types/booking';

interface AvailabilityIndicatorProps {
    segments: AvailabilitySegment[];
}

const STATUS_CONFIG: Record<AvailabilitySegment['status'], { color: string; label: string }> = {
    available: { color: '#22c55e', label: 'Tersedia' },
    booked: { color: '#ef4444', label: 'Terisi' },
    unpaid: { color: '#f97316', label: 'Booking Belum Dibayar' },
};

export default function AvailabilityIndicator({ segments }: AvailabilityIndicatorProps) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <CircleDot className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />
                <p className="text-sm font-semibold text-gray-900">Ketersediaan Studio Hari Ini</p>
            </div>

            {segments.length === 0 ? (
                <p className="text-sm text-gray-400">Studio kosong sepanjang hari ini.</p>
            ) : (
                <>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        {segments.map((segment, index) => {
                            const [sh, sm] = segment.start.split(':').map(Number);
                            const [eh, em] = segment.end.split(':').map(Number);
                            const duration = eh * 60 + em - (sh * 60 + sm);
                            return (
                                <div
                                    key={index}
                                    className="h-full first:rounded-l-full last:rounded-r-full"
                                    style={{
                                        width: `${Math.max(duration, 5)}px`,
                                        flexGrow: duration,
                                        backgroundColor: STATUS_CONFIG[segment.status].color,
                                    }}
                                    title={`${segment.start} - ${segment.end}: ${STATUS_CONFIG[segment.status].label}`}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                        {segments.map((segment, index) => (
                            <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_CONFIG[segment.status].color }} />
                                <span className="font-medium">
                                    {segment.start} - {segment.end}
                                </span>
                                <span className="text-gray-400">{STATUS_CONFIG[segment.status].label}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
