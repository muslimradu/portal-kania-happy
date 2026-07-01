import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps extends PropsWithChildren {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function SectionCard({ title, description, action, children, className }: SectionCardProps) {
    return (
        <div className={cn('rounded-2xl bg-white shadow-sm', className)}>
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {description && (
                        <p className="mt-0.5 text-xs text-gray-400">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}