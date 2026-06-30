import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGlobalSearchStore } from '@/hooks/useGlobalSearch';

export default function GlobalSearchDialog() {
    const { isOpen, setOpen } = useGlobalSearchStore();

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="top-32 max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                        autoFocus
                        placeholder="Cari halaman, menu, atau data..."
                        className="border-none p-0 shadow-none focus-visible:ring-0"
                    />
                    <kbd className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400">
                        ESC
                    </kbd>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                    <Search className="h-8 w-8 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">
                        Pencarian belum tersedia
                    </p>
                    <p className="text-xs text-gray-400">
                        Fitur pencarian data akan segera hadir di pembaruan berikutnya.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}