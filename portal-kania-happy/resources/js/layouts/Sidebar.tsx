import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, LogOut } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import { navigationItems } from '@/lib/navigation';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function Sidebar() {
    const { isOpen, toggle } = useSidebarStore();
    const { url, props } = usePage();
    const settings = (props as any).settings;

    return (
        <aside
            className={cn(
                'sticky top-0 hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200 lg:flex',
                isOpen ? 'w-64' : 'w-20',
            )}
        >
            {/* Logo & Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4">
                <AppLogo size="sm" />
                {isOpen && (
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-gray-900">
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
                {navigationItems.map((item) => {
                    const isActive = url.startsWith(item.href) && item.href !== '#';
                    const Icon = item.icon;

                    const content = (
                        <div
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                                isActive
                                    ? 'bg-violet-50 text-violet-700'
                                    : item.disabled
                                      ? 'cursor-not-allowed text-gray-300'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                !isOpen && 'justify-center',
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {isOpen && <span className="truncate">{item.label}</span>}
                        </div>
                    );

                    if (!isOpen) {
                        return (
                            <Tooltip key={item.label} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    {item.disabled ? (
                                        <div>{content}</div>
                                    ) : (
                                        <Link href={item.href}>{content}</Link>
                                    )}
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {item.label}
                                    {item.disabled && ' (Segera Hadir)'}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return item.disabled ? (
                        <div key={item.label}>{content}</div>
                    ) : (
                        <Link key={item.label} href={item.href}>
                            {content}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 p-3">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50',
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
                className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
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