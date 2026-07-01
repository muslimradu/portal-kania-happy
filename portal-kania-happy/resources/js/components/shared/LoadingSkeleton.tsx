import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    className?: string;
    count?: number;
}

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn('animate-pulse rounded-lg bg-gray-100', className)} />
    );
}

export default function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={cn('space-y-3', className)}>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ))}
        </>
    );
}