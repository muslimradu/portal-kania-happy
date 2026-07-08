import { FormEventHandler, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Loader2, TriangleAlert } from 'lucide-react';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Membership } from '@/types/membership';

interface DeleteMembershipDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    membership: Membership;
}

export default function DeleteMembershipDialog({ open, onOpenChange, membership }: DeleteMembershipDialogProps) {
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const closeModal = () => {
        onOpenChange(false);
        clearErrors();
        reset();
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('memberships.destroy', membership.uuid), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeModal()}>
            <DialogContent showCloseButton={false} className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                                <TriangleAlert className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <DialogTitle>Hapus Membership?</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Membership <span className="font-medium text-gray-700">{membership.package_name}</span> akan
                                    dihapus permanen beserta data keuangannya di seluruh laporan. Masukkan password Anda untuk
                                    melanjutkan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        <InputLabel htmlFor="delete-membership-password" value="Password" />
                        <TextInput
                            id="delete-membership-password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Masukkan password"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={closeModal} disabled={processing} className="rounded-xl">
                            Batal
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing} className="rounded-xl">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                'Hapus Membership'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
