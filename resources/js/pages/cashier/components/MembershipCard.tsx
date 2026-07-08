import type { Membership, MembershipDetail } from '@/types/membership';
import { formatCashierMembershipExpiry } from '@/lib/membership-expiry';

function quotaPool(detail: MembershipDetail, details: MembershipDetail[]): MembershipDetail {
    if (detail.quota_group == null) {
        return detail;
    }

    return details.find((item) => item.quota_group === detail.quota_group && (item.quota != null || item.is_unlimited)) ?? detail;
}

function remainingQuota(detail: MembershipDetail, details: MembershipDetail[]): number | null {
    const pool = quotaPool(detail, details);
    if (pool.is_unlimited) {
        return null;
    }

    return Math.max(0, (pool.quota ?? 0) - pool.quota_used);
}

interface MembershipCardProps {
    membership: Membership;
    activeGymClassId?: number | null;
}

export default function MembershipCard({ membership, activeGymClassId }: MembershipCardProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{membership.package_name}</p>
                <span className="text-xs text-gray-500">
                    {formatCashierMembershipExpiry(
                        membership.start_date,
                        membership.end_date,
                        membership.membership_package,
                    )}
                </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {membership.details.map((detail) => {
                    const isHighlighted = activeGymClassId != null && detail.gym_class_id === activeGymClassId;
                    const remaining = remainingQuota(detail, membership.details);
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
