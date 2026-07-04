import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type FieldErrors, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

interface InertiaSubmitOptions {
    onSuccess?: () => void;
    successMessage?: string;
    errorMessage?: string;
    preserveScroll?: boolean;
    preserveState?: boolean;
}

export function useInertiaSubmit() {
    const [processing, setProcessing] = useState(false);
    const processingRef = useRef(false);

    const submit = useCallback(
        (url: string, data: Record<string, unknown> = {}, options: InertiaSubmitOptions = {}) => {
            if (processingRef.current) {
                return;
            }

            processingRef.current = true;
            setProcessing(true);

            const { onSuccess, successMessage, errorMessage, preserveScroll, preserveState } = options;

            router.post(url, data as Record<string, string | number | boolean | null>, {
                preserveScroll,
                preserveState,
                onSuccess: () => {
                    if (successMessage) {
                        toast.success(successMessage);
                    }
                    onSuccess?.();
                },
                onError: () => {
                    if (errorMessage) {
                        toast.error(errorMessage);
                    }
                },
                onFinish: () => {
                    processingRef.current = false;
                    setProcessing(false);
                },
            });
        },
        [],
    );

    return { processing, submit };
}

export function useFocusFirstError<T extends FieldValues>(
    errors: FieldErrors<T>,
    isSubmitted: boolean,
) {
    useEffect(() => {
        if (!isSubmitted) {
            return;
        }

        const firstKey = Object.keys(errors)[0];
        if (!firstKey) {
            return;
        }

        const element =
            document.querySelector<HTMLElement>(`[name="${firstKey}"]`) ??
            document.querySelector<HTMLElement>(`[id="${firstKey}"]`);

        element?.focus();
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [errors, isSubmitted]);
}

export function useFormFocus<T extends FieldValues>(form: UseFormReturn<T>) {
    useFocusFirstError(form.formState.errors, form.formState.isSubmitted);
}
