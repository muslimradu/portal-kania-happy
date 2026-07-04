import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Lightweight live-refresh: periodically re-fetches only the given Inertia props
 * (partial reload) so dashboards/reports reflect new transactions without a full
 * page reload. Uses Inertia's built-in poll, which already pauses while the
 * browser tab is hidden. No broadcasting infrastructure required.
 */
export function usePollingReload(only: string[], intervalMs = 20000) {
    const key = only.join(',');

    useEffect(() => {
        if (only.length === 0) return;

        const { stop } = router.poll(intervalMs, { only }, { keepAlive: false });

        return () => stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, intervalMs]);
}
