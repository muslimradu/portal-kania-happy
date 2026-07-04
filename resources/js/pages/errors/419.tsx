import { Link } from '@inertiajs/react';
import { Home, RefreshCw } from 'lucide-react';

export default function PageExpired() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
                    <RefreshCw className="h-12 w-12 text-amber-600" />
                </div>
                <h1 className="text-6xl font-bold text-amber-600">419</h1>
                <p className="mt-2 text-xl font-semibold text-gray-800">
                    Sesi Kedaluwarsa
                </p>
                <p className="mt-2 max-w-md text-gray-500">
                    Halaman ini sudah tidak valid karena sesi kamu berakhir. Silakan muat ulang halaman dan coba lagi.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    <RefreshCw className="h-4 w-4" />
                    Muat Ulang Halaman
                </button>
                <Link
                    href="/dashboard"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <Home className="h-4 w-4" />
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    );
}
