import { Link } from '@inertiajs/react';
import { Home, ServerCrash } from 'lucide-react';

export default function ServerError() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
                    <ServerCrash className="h-12 w-12 text-orange-600" />
                </div>
                <h1 className="text-6xl font-bold text-orange-600">500</h1>
                <p className="mt-2 text-xl font-semibold text-gray-800">
                    Terjadi Kesalahan Server
                </p>
                <p className="mt-2 max-w-md text-gray-500">
                    Maaf, terjadi kesalahan di server kami. Tim kami sudah diberitahu.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    <Home className="h-4 w-4" />
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    );
}