import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

function firstErrorMessage(errors: Record<string, string | string[]>): string | null {
    for (const value of Object.values(errors)) {
        const message = Array.isArray(value) ? value[0] : value;
        if (message) {
            return message;
        }
    }

    return null;
}

export function useValidationErrorToast() {
    const { errors } = usePage().props as { errors?: Record<string, string | string[]> };
    const lastShownRef = useRef<string>('');

    useEffect(() => {
        if (!errors || Object.keys(errors).length === 0) {
            lastShownRef.current = '';
            return;
        }

        const serialized = JSON.stringify(errors);
        if (serialized === lastShownRef.current) {
            return;
        }

        const message = firstErrorMessage(errors);
        if (message) {
            toast.error(message);
            lastShownRef.current = serialized;
        }
    }, [errors]);
}
