export interface MembershipPackageExpiry {
    expired_type: string | null;
    expired_duration: number | null;
}

const DURATION_LABELS: Record<string, string> = {
    days: 'Hari',
    weeks: 'Minggu',
    months: 'Bulan',
    years: 'Tahun',
};

export function formatPackageDuration(
    type: string | null | undefined,
    duration: number | null | undefined,
): string | null {
    if (!type || type === 'manual' || !duration) {
        return null;
    }

    return `${duration} ${DURATION_LABELS[type] ?? type}`;
}

function formatUnusedExpiry(pkg?: MembershipPackageExpiry | null): string {
    const duration = formatPackageDuration(pkg?.expired_type, pkg?.expired_duration);

    if (duration) {
        return `Exp: ${duration} dari check-in pertama`;
    }

    return 'Exp: Manual';
}

export function formatCashierMembershipExpiry(
    startDate: string | null,
    endDate: string | null,
    pkg?: MembershipPackageExpiry | null,
): string {
    if (!startDate) {
        return formatUnusedExpiry(pkg);
    }
    if (!endDate) return 'Exp: Tanpa batas';
    return `Exp: ${new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

export function formatMemberMembershipExpiry(
    startDate: string | null,
    endDate: string | null,
    pkg?: MembershipPackageExpiry | null,
): string {
    if (!startDate) {
        return formatUnusedExpiry(pkg);
    }
    if (!endDate) return 'Exp: Tanpa batas';
    return `Exp: ${new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
}
