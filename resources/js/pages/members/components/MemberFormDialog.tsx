import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import MemberForm from './MemberForm';
import type { Member } from '@/types/member';
import type { MemberFormValues } from '@/lib/validations/member';

interface MemberFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
}

export default function MemberFormDialog({ open, onOpenChange, member }: MemberFormDialogProps) {
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (data: MemberFormValues) => {
        setProcessing(true);
        router.patch(route('members.update', member.uuid), data, {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'white', width: '90vw', maxWidth: '540px' }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Member: {member.name}</DialogTitle>
                </DialogHeader>
                <MemberForm member={member} onSubmit={handleSubmit} processing={processing} />
            </DialogContent>
        </Dialog>
    );
}
