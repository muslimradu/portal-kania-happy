import type { NavItem } from './navigation';

function hasPermission(permissions: string[], required?: string | string[]): boolean {
    if (!required) {
        return true;
    }

    const requiredList = Array.isArray(required) ? required : [required];

    return requiredList.some((permission) => permissions.includes(permission));
}

export function filterNavigationItems(items: NavItem[], permissions: string[]): NavItem[] {
    return items
        .map((item) => {
            if (item.children?.length) {
                const children = filterNavigationItems(item.children, permissions);

                if (children.length === 0) {
                    return null;
                }

                return { ...item, children };
            }

            return hasPermission(permissions, item.permission) ? item : null;
        })
        .filter((item): item is NavItem => item !== null);
}
