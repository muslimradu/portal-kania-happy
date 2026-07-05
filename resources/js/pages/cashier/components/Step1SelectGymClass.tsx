import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/shared/SearchInput';
import GymClassCard from './GymClassCard';
import type { CashierGymClass } from '@/types/cashier';

interface Step1SelectGymClassProps {
    gymClasses: CashierGymClass[];
    selected: CashierGymClass | null;
    onSelect: (gymClass: CashierGymClass) => void;
    onNext: () => void;
}

export default function Step1SelectGymClass({ gymClasses, selected, onSelect, onNext }: Step1SelectGymClassProps) {
    const [search, setSearch] = useState('');

    const filtered = gymClasses.filter((gymClass) => gymClass.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Pilih Kelas Gym</h2>
                <p className="text-sm text-gray-500">Pilih kelas yang akan diikuti oleh customer.</p>
            </div>

            <SearchInput
                id="cashier-search"
                value={search}
                onChange={setSearch}
                placeholder="Cari kelas gym... (Ctrl+K)"
                className="max-w-md"
            />

            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
                    Tidak ada kelas gym yang cocok.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filtered.map((gymClass) => (
                        <GymClassCard
                            key={gymClass.uuid}
                            gymClass={gymClass}
                            selected={selected?.uuid === gymClass.uuid}
                            onSelect={() => onSelect(gymClass)}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={!selected}
                    className="rounded-xl px-8"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
