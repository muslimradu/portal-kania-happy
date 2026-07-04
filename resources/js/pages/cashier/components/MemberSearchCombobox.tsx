import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { CashierMember } from '@/types/cashier';

interface MemberSearchComboboxProps {
    onSelect: (member: CashierMember) => void;
}

export default function MemberSearchCombobox({ onSelect }: MemberSearchComboboxProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CashierMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(() => {
            axios
                .get(route('cashier.members.search'), { params: { q: query } })
                .then((res) => {
                    setResults(res.data.data ?? []);
                    setOpen(true);
                })
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    id="cashier-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder="Cari nama atau nomor telepon member... (Ctrl+K)"
                    className="rounded-xl pl-9 pr-9"
                    autoFocus
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />}
            </div>

            {open && (
                <div className="absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                    {results.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-gray-400">Member tidak ditemukan.</p>
                    ) : (
                        results.map((member) => (
                            <button
                                key={member.uuid}
                                type="button"
                                onClick={() => {
                                    onSelect(member);
                                    setOpen(false);
                                    setQuery(member.name);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-gray-50"
                            >
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: 'var(--brand-primary)' }}
                                >
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                    <p className="text-xs text-gray-400">{member.phone}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
