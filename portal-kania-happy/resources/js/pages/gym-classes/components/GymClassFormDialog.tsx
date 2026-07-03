import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import GymClassForm from './GymClassForm';
import type { GymClass } from '@/types/gym-class';
import type { GymClassFormValues } from '@/lib/validations/gym-class';

interface GymClassFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gymClass?: GymClass;
}

export default function GymClassFormDialog({
    open,
    onOpenChange,
    gymClass,
}: GymClassFormDialogProps) {
    const [processing, setProcessing] = useState(false);
    const isEdit = !!gymClass;

    const handleSubmit = (data: GymClassFormValues) => {
        setProcessing(true);

        const options = {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        };

        if (isEdit) {
            router.patch(route('gym-classes.update', gymClass.uuid), data, options);
        } else {
            router.post(route('gym-classes.store'), data, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-3xl"
                style={{ backgroundColor: 'white' }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Edit Kelas: ${gymClass.name}` : 'Tambah Kelas Gym'}
                    </DialogTitle>
                </DialogHeader>
                <GymClassForm
                    gymClass={gymClass}
                    onSubmit={handleSubmit}
                    processing={processing}
                />
            </DialogContent>
        </Dialog>
    );
}