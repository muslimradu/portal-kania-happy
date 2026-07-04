import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    id?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Cari...',
    className,
    autoFocus,
    id,
}: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={cn('relative', className)}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                id={id}
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="rounded-xl pl-9 pr-9"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}