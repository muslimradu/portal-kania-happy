export interface PackageGroup {
    gym_class_ids: number[];
    quota: number | null;
    is_unlimited: boolean;
}

export interface PackageDetailInput {
    gym_class_id: number;
    quota: number | null;
    is_unlimited: boolean;
    quota_group?: number | null;
}

export function detailsToGroups(details: PackageDetailInput[]): PackageGroup[] {
    const groups: PackageGroup[] = [];
    const grouped = new Map<number, PackageDetailInput[]>();

    for (const detail of details) {
        if (detail.quota_group == null) {
            groups.push({
                gym_class_ids: [detail.gym_class_id],
                quota: detail.quota,
                is_unlimited: detail.is_unlimited,
            });
            continue;
        }

        const bucket = grouped.get(detail.quota_group) ?? [];
        bucket.push(detail);
        grouped.set(detail.quota_group, bucket);
    }

    for (const rows of grouped.values()) {
        const pool = rows.find((row) => row.quota !== null || row.is_unlimited) ?? rows[0];
        groups.push({
            gym_class_ids: rows.map((row) => row.gym_class_id),
            quota: pool.quota,
            is_unlimited: pool.is_unlimited,
        });
    }

    return groups;
}

export function groupsToDetails(groups: PackageGroup[]): PackageDetailInput[] {
    const details: PackageDetailInput[] = [];
    let groupCounter = 1;

    for (const group of groups) {
        if (group.gym_class_ids.length === 1) {
            details.push({
                gym_class_id: group.gym_class_ids[0],
                quota: group.is_unlimited ? null : group.quota,
                is_unlimited: group.is_unlimited,
                quota_group: null,
            });
            continue;
        }

        const quotaGroup = groupCounter++;
        group.gym_class_ids.forEach((gymClassId, index) => {
            details.push({
                gym_class_id: gymClassId,
                quota: group.is_unlimited ? null : (index === 0 ? group.quota : null),
                is_unlimited: group.is_unlimited,
                quota_group: quotaGroup,
            });
        });
    }

    return details;
}

export function formatGroupLabel(group: PackageGroup, classNames: string[]): string {
    const names = classNames.join(' / ');
    if (group.is_unlimited) {
        return `${names} · Unlimited`;
    }

    return `${names} · ${group.quota}x`;
}
