import { create } from 'zustand';
import { useEffect } from 'react';

interface GlobalSearchState {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
}

export const useGlobalSearchStore = create<GlobalSearchState>((set) => ({
    isOpen: false,
    setOpen: (open) => set({ isOpen: open }),
}));

export function useGlobalSearchShortcut() {
    const setOpen = useGlobalSearchStore((state) => state.setOpen);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [setOpen]);
}