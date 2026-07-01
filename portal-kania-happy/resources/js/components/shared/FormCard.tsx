import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormCardProps extends PropsWithChildren {
    title: string;
    description?: string;
    footer?: ReactNode;
    className?: string;
}

export default function FormCard({ title, description, footer, children, className }: FormCardProps) {
    return (
        <div className={cn('rounded-2xl bg-white shadow-sm', className)}>
            <div className="border-b border-gray-50 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {description && (
                    <p className="mt-0.5 text-xs text-gray-400">{description}</p>
                )}
            </div>
            <div className="p-6">{children}</div>
            {footer && (
                <div className="border-t border-gray-50 px-6 py-4">
                    {footer}
                </div>
            )}
        </div>
    );
}