import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Search,
    LayoutDashboard,
    Settings,
    Palette,
    X,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGlobalSearchStore } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

interface QuickLink {
    label: string;
    description: string;
    href: string;
    icon: React.ElementType;
}

const quickLinks: QuickLink[] = [
    {
        label: 'Dashboard',
        description: 'Halaman utama Portal Kania Happy',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'General Settings',
        description: 'Konfigurasi umum aplikasi',
        href: '/settings/general',
        icon: Settings,
    },
    {
        label: 'Branding',
        description: 'Kustomisasi tampilan dan warna',
        href: '/settings/branding',
        icon: Palette,
    },
];

export default function GlobalSearchDialog() {
    const { isOpen, setOpen } = useGlobalSearchStore();
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = query.trim()
        ? quickLinks.filter(
              (link) =>
                  link.label.toLowerCase().includes(query.toLowerCase()) ||
                  link.description.toLowerCase().includes(query.toLowerCase()),
          )
        : quickLinks;

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[activeIndex]) {
                window.location.href = filtered[activeIndex].href;
                setOpen(false);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent
                showCloseButton={false}
                className="max-w-xl gap-0 overflow-hidden p-0"
                style={{ backgroundColor: 'white' }}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                    <Search className="h-5 w-5 shrink-0 text-gray-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Cari halaman atau menu..."
                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <kbd className="hidden items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400 sm:inline-flex">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Search className="h-8 w-8 text-gray-200" />
                            <p className="mt-3 text-sm font-medium text-gray-500">
                                Tidak ada hasil untuk "{query}"
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Coba kata kunci yang berbeda
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {query ? 'Hasil Pencarian' : 'Navigasi Cepat'}
                            </p>
                            {filtered.map((link, index) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl px-3 py-2.5 transition',
                                            activeIndex === index
                                                ? 'bg-gray-100'
                                                : 'hover:bg-gray-50',
                                        )}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                                                color: 'var(--brand-primary)',
                                            }}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {link.label}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {link.description}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-4 py-2.5">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">↑</kbd>
                            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">↓</kbd>
                            Navigasi
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">↵</kbd>
                            Buka
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">ESC</kbd>
                            Tutup
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}