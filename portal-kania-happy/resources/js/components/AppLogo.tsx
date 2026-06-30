interface AppLogoProps {
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
};

export default function AppLogo({ size = 'md' }: AppLogoProps) {
    return (
        <div
            className={`flex items-center justify-center rounded-full bg-violet-600 font-bold text-white shadow-lg ${sizeClasses[size]}`}
        >
            KH
        </div>
    );
}