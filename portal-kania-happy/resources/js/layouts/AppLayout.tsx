import { PropsWithChildren } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import Navbar from '@/components/layout/Navbar';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import GlobalSearchDialog from '@/components/layout/GlobalSearchDialog';
import { useGlobalSearchShortcut } from '@/hooks/useGlobalSearch';
import { useFlashToast } from '@/hooks/useFlashToast';

interface AppLayoutProps extends PropsWithChildren {
    title?: string;
    breadcrumb?: { label: string; href?: string }[];
}

export default function AppLayout({ children, breadcrumb }: AppLayoutProps) {
    useGlobalSearchShortcut();
    useFlashToast();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <MobileSidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 px-4 py-6 lg:px-6">
                    <div className="mb-4">
                        <PageBreadcrumb items={breadcrumb} />
                    </div>
                    {children}
                </main>
            </div>

            <GlobalSearchDialog />
        </div>
    );
}