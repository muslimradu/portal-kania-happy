import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageBreadcrumbProps {
    items?: BreadcrumbItem[];
}

export default function PageBreadcrumb({ items }: PageBreadcrumbProps) {
    const { url } = usePage();

    const autoItems: BreadcrumbItem[] = items ?? generateFromUrl(url);

    return (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/dashboard" className="flex items-center transition" style={{ color: 'inherit' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                <Home className="h-3.5 w-3.5" />
            </Link>
            {autoItems.map((item, index) => (
                <Fragment key={index}>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                    {item.href && index !== autoItems.length - 1 ? (
                        <Link href={item.href} className="transition" onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-900">{item.label}</span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}

function generateFromUrl(url: string): BreadcrumbItem[] {
    const segments = url.split('?')[0].split('/').filter(Boolean);

    return segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return { label, href };
    });
}