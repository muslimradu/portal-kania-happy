import { usePage, Link } from '@inertiajs/react';
import { Search, Bell, Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { useGlobalSearchStore } from '@/hooks/useGlobalSearch';
import type { User } from '@/types';

export default function Navbar() {
    const { props } = usePage();
    const user = (props as any).auth?.user as User | null;
    const { setMobileOpen } = useSidebarStore();
    const setSearchOpen = useGlobalSearchStore((s) => s.setOpen);

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm lg:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu trigger */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Global Search trigger */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-100 sm:w-64"
                >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Cari sesuatu...</span>
                    <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-400 sm:inline-flex">
                        ⌘K
                    </kbd>
                </button>
            </div>

            <div className="flex items-center gap-2">
                {/* Notification Placeholder */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl text-gray-500 hover:bg-gray-100"
                >
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Profile Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl p-1.5 pr-3 transition hover:bg-gray-100">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-violet-100 text-sm font-semibold text-violet-700">
                                {initials ?? 'AD'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.name ?? 'Administrator'}
                            </p>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs font-normal text-gray-400">
                                    {user?.email}
                                </p>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href="/profile" className="w-full">Profil Saya</Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem variant="destructive" className="cursor-pointer">
                                <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                                    Keluar
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}