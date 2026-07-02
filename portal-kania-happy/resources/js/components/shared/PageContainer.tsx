import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends PropsWithChildren {
    className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {children}
        </div>
    );
}