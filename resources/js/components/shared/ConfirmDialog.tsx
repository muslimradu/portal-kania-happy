import { Loader2, TriangleAlert } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    processing?: boolean;
    onConfirm: () => void;
}

const variantConfig = {
    danger: {
        icon: TriangleAlert,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
        icon: TriangleAlert,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
    default: {
        icon: TriangleAlert,
        iconBg: 'bg-gray-50',
        iconColor: 'text-gray-500',
        buttonClass: 'bg-gray-900 hover:bg-gray-800 text-white',
    },
};

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    variant = 'danger',
    processing = false,
    onConfirm,
}: ConfirmDialogProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-md">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
                            <Icon className={`h-5 w-5 ${config.iconColor}`} />
                        </div>
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                        className="rounded-xl"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={processing}
                        className={`rounded-xl ${config.buttonClass}`}
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}