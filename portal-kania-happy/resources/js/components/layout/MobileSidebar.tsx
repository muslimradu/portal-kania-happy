import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import AppLogo from '@/components/AppLogo';
import { navigationItems } from '@/lib/navigation';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { cn } from '@/lib/utils';

export default function MobileSidebar() {
    const { isMobileOpen, setMobileOpen } = useSidebarStore();
    const { url, props } = usePage();
    const settings = (props as any).settings;

    return (
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4">
                    <AppLogo size="sm" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            {settings?.app_name ?? 'Portal Kania Happy'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {settings?.app_tagline ?? 'Rumah Sehat & Sanggar Senam'}
                        </p>
                    </div>
                </div>

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
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </div>
                        );

                        return item.disabled ? (
                            <div key={item.label}>{content}</div>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-100 p-3">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span>Logout</span>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}