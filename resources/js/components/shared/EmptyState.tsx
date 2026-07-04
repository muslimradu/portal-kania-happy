import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <Icon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-700">{title}</h3>
            <p className="mt-1 max-w-xs text-sm text-gray-400">{description}</p>
            {action && (
                <Button
                    onClick={action.onClick}
                    variant="outline"
                    className="mt-4 rounded-xl"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}