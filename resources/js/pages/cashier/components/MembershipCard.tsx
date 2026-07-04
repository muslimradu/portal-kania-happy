import type { Membership } from '@/types/membership';

interface MembershipCardProps {
    membership: Membership;
    activeGymClassId?: number | null;
}

function formatDate(value: string | null): string {
    if (!value) return 'Tanpa batas';
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MembershipCard({ membership, activeGymClassId }: MembershipCardProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{membership.package_name}</p>
                <span className="text-xs text-gray-500">Exp: {formatDate(membership.end_date)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {membership.details.map((detail) => {
                    const isHighlighted = activeGymClassId != null && detail.gym_class_id === activeGymClassId;
                    const remaining = detail.is_unlimited ? null : Math.max(0, (detail.quota ?? 0) - detail.quota_used);
                    return (
                        <span
                            key={detail.uuid}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium text-white transition ${
                                isHighlighted ? 'ring-2 ring-offset-1' : ''
                            }`}
                            style={{
                                backgroundColor: detail.gym_class?.color_label ?? '#6b7280',
                                ...(isHighlighted ? { ['--tw-ring-color' as string]: 'var(--brand-primary)' } : {}),
                            }}
                        >
                            {detail.class_name} · {detail.is_unlimited ? 'Unlimited' : `${remaining}x sisa`}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
