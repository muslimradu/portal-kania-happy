import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'portal-dismissed-notifications';

function readDismissed(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
}

function writeDismissed(ids: string[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useDismissedNotifications(allIds: string[]) {
    const [dismissed, setDismissed] = useState<string[]>(readDismissed);

    useEffect(() => {
        setDismissed((prev) => {
            const active = new Set(allIds);
            const pruned = prev.filter((id) => active.has(id));

            if (pruned.length !== prev.length) {
                writeDismissed(pruned);
            }

            return pruned;
        });
    }, [allIds]);

    const dismiss = useCallback((id: string) => {
        setDismissed((prev) => {
            if (prev.includes(id)) {
                return prev;
            }

            const next = [...prev, id];
            writeDismissed(next);

            return next;
        });
    }, []);

    const isDismissed = useCallback((id: string) => dismissed.includes(id), [dismissed]);

    return { dismissed, dismiss, isDismissed };
}
