import '../css/app.css';
import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as ziggyRoute } from 'ziggy-js';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';

declare global {
    var route: typeof ziggyRoute;
}

createInertiaApp({
    title: (title) => `${title} - Portal Kania Happy`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        if (!el) return;
        const root = createRoot(el);
        root.render(
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <TooltipProvider>
                    <App {...props} />
                    <Toaster position="top-right" richColors closeButton />
                </TooltipProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#7C3AED',
    },
} as Parameters<typeof createInertiaApp>[0]);