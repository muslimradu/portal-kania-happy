import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronDown, LogOut } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import { navigationItems, type NavItem } from '@/lib/navigation';
import { filterNavigationItems } from '@/lib/navigationFilter';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function isUrlActive(url: string, href: string): boolean {
    if (href === '#') return false;
    const currentPath = url.split('?')[0];
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function NavItemRow({
    item,
    isOpen,
    url,
}: {
    item: NavItem;
    isOpen: boolean;
    url: string;
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = !hasChildren && isUrlActive(url, item.href);
    const isChildActive = item.children?.some((child) => isUrlActive(url, child.href));
    const [expanded, setExpanded] = useState(isChildActive ?? false);
    const Icon = item.icon;

    const rowContent = (
        <div
        className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
            isActive || isChildActive
                ? 'bg-opacity-10'
                : item.disabled
                  ? 'cursor-not-allowed text-gray-300'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-white',
            !isOpen && 'justify-center',
        )}
        style={isActive || isChildActive ? {
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
            color: 'var(--brand-primary)',
        } : undefined}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {isOpen && (
                <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {hasChildren && (
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                expanded && 'rotate-180',
                            )}
                        />
                    )}
                </>
            )}
        </div>
    );

    const wrappedRow = !isOpen ? (
        <Tooltip key={item.label}>
            <TooltipTrigger>
                {item.disabled ? (
                    <div>{rowContent}</div>
                ) : hasChildren ? (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full"
                    >
                        {rowContent}
                    </button>
                ) : (
                    <Link href={item.href}>{rowContent}</Link>
                )}
            </TooltipTrigger>
            <TooltipContent side="right">
                {item.label}
                {item.disabled && ' (Segera Hadir)'}
            </TooltipContent>
        </Tooltip>
    ) : item.disabled ? (
        <div>{rowContent}</div>
    ) : hasChildren ? (
        <button
            onClick={() => setExpanded(!expanded)}
            className="w-full"
        >
            {rowContent}
        </button>
    ) : (
        <Link href={item.href}>{rowContent}</Link>
    );

    return (
        <div key={item.label}>
            {wrappedRow}
            {hasChildren && isOpen && expanded && (
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
                            <Link key={child.label} href={child.href}>
                                {childContent}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Sidebar() {
    const { isOpen, toggle } = useSidebarStore();
    const { url, props } = usePage();
    const settings = (props as any).settings;
    const permissions: string[] = (props as any).auth?.user?.permissions ?? [];
    const visibleNavigation = filterNavigationItems(navigationItems, permissions);

    return (
        <aside
            className={cn(
                'sticky top-0 hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-950 md:flex',
                isOpen ? 'w-64' : 'w-20',
            )}
        >
            {/* Logo & Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4 dark:border-gray-800">
                <AppLogo size="sm" />
                {isOpen && (
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                            {settings?.app_name ?? 'Portal Kania Happy'}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                            {settings?.app_tagline ?? 'Rumah Sehat & Sanggar Senam'}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {visibleNavigation.map((item) => (
                    <NavItemRow
                        key={item.label}
                        item={item}
                        isOpen={isOpen}
                        url={url}
                    />
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30',
                        !isOpen && 'justify-center',
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {isOpen && <span>Logout</span>}
                </Link>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={toggle}
                className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
                <ChevronLeft
                    className={cn(
                        'h-3.5 w-3.5 text-gray-500 transition-transform',
                        !isOpen && 'rotate-180',
                    )}
                />
            </button>
        </aside>
    );
}