import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, ChevronDown } from 'lucide-react';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import AppLogo from '@/components/AppLogo';
import { navigationItems, type NavItem } from '@/lib/navigation';
import { filterNavigationItems } from '@/lib/navigationFilter';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { cn } from '@/lib/utils';

function isUrlActive(url: string, href: string): boolean {
    if (href === '#') return false;
    const currentPath = url.split('?')[0];
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function MobileNavItem({
    item,
    url,
    onClose,
}: {
    item: NavItem;
    url: string;
    onClose: () => void;
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = item.children?.some((child) => isUrlActive(url, child.href));
    const [expanded, setExpanded] = useState(isChildActive ?? false);
    const isActive = !hasChildren && isUrlActive(url, item.href);
    const Icon = item.icon;

    const rowContent = (
        <div
        className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
            isActive || isChildActive
                ? ''
                : item.disabled
                  ? 'cursor-not-allowed text-gray-300'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-white',
        )}
        style={isActive || isChildActive ? {
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
            color: 'var(--brand-primary)',
        } : undefined}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {hasChildren && (
                <ChevronDown
                    className={cn(
                        'h-4 w-4 transition-transform',
                        expanded && 'rotate-180',
                    )}
                />
            )}
        </div>
    );

    return (
        <div>
            {item.disabled ? (
                <div>{rowContent}</div>
            ) : hasChildren ? (
                <button onClick={() => setExpanded(!expanded)} className="w-full">
                    {rowContent}
                </button>
            ) : (
                <Link href={item.href} onClick={onClose}>
                    {rowContent}
                </Link>
            )}

            {hasChildren && expanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3 dark:border-gray-800">
                    {item.children!.map((child) => {
                        const childActive = isUrlActive(url, child.href);
                        const ChildIcon = child.icon;

                        const childContent = (
                            <div
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                                childActive
                                    ? ''
                                    : child.disabled
                                      ? 'cursor-not-allowed text-gray-300'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-white',
                            )}
                            style={childActive ? {
                                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                                color: 'var(--brand-primary)',
                            } : undefined}
                            >
                                <ChildIcon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{child.label}</span>
                                {child.disabled && (
                                    <span className="ml-auto text-xs text-gray-300">
                                        Soon
                                    </span>
                                )}
                            </div>
                        );

                        return child.disabled ? (
                            <div key={child.label}>{childContent}</div>
                        ) : (
                            <Link key={child.label} href={child.href} onClick={onClose}>
                                {childContent}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function MobileSidebar() {
    const { isMobileOpen, setMobileOpen } = useSidebarStore();
    const { url, props } = usePage();
    const settings = (props as any).settings;
    const permissions: string[] = (props as any).auth?.user?.permissions ?? [];
    const visibleNavigation = filterNavigationItems(navigationItems, permissions);

    return (
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-72 border-gray-200 bg-white p-0 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4 dark:border-gray-800">
                    <AppLogo size="sm" />
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {settings?.app_name ?? 'Portal Kania Happy'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {settings?.app_tagline ?? 'Rumah Sehat & Sanggar Senam'}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {visibleNavigation.map((item) => (
                        <MobileNavItem
                            key={item.label}
                            item={item}
                            url={url}
                            onClose={() => setMobileOpen(false)}
                        />
                    ))}
                </nav>

                <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span>Logout</span>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}