import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import PackageForm from './PackageForm';
import type { MembershipPackage } from '@/types/membership-package';
import type { GymClass } from '@/types/gym-class';
import type { MembershipPackageFormValues } from '@/lib/validations/membership-package';

interface PackageFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pkg?: MembershipPackage;
    gymClasses: GymClass[];
}

export default function PackageFormDialog({
    open,
    onOpenChange,
    pkg,
    gymClasses,
}: PackageFormDialogProps) {
    const [processing, setProcessing] = useState(false);
    const isEdit = !!pkg;

    const handleSubmit = (data: MembershipPackageFormValues) => {
        setProcessing(true);

        const options = {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        };

        if (isEdit) {
            router.patch(route('membership-packages.update', pkg.uuid), data, options);
        } else {
            router.post(route('membership-packages.store'), data, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '900px' }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Edit Paket: ${pkg.name}` : 'Tambah Paket Membership'}
                    </DialogTitle>
                </DialogHeader>
                <PackageForm
                    pkg={pkg}
                    gymClasses={gymClasses}
                    onSubmit={handleSubmit}
                    processing={processing}
                />
            </DialogContent>
        </Dialog>
    );
}
