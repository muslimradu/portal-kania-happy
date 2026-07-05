import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TrainingForm from './TrainingForm';
import type { Training } from '@/types/training';
import type { TrainingFormValues } from '@/lib/validations/training';

interface TrainingFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    training?: Training;
}

export default function TrainingFormDialog({ open, onOpenChange, training }: TrainingFormDialogProps) {
    const [processing, setProcessing] = useState(false);
    const isEdit = !!training;

    const handleSubmit = (data: TrainingFormValues) => {
        setProcessing(true);

        const payload = {
            ...data,
            training_dates: data.training_dates.filter(Boolean),
            description: data.description || null,
            training_location: data.training_location || null,
        };

        const options = {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        };

        if (isEdit) {
            router.patch(route('trainings.update', training.uuid), payload, options);
        } else {
            router.post(route('trainings.store'), payload, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '640px' }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Edit Pelatihan: ${training.title}` : 'Tambah Pelatihan'}
                    </DialogTitle>
                </DialogHeader>
                <TrainingForm training={training} onSubmit={handleSubmit} processing={processing} />
            </DialogContent>
        </Dialog>
    );
}
