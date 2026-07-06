import { QRCodeSVG } from 'qrcode.react';
import type { PaymentConfiguration } from '@/types/payment-configuration';

type QrisPreviewConfig = Pick<PaymentConfiguration, 'qris_type' | 'qris_image' | 'qris_url' | 'name'>;

interface QrisPreviewProps {
    config: QrisPreviewConfig;
    size?: number;
    className?: string;
}

export default function QrisPreview({ config, size = 112, className = '' }: QrisPreviewProps) {
    if (config.qris_type === 'url' && config.qris_url) {
        return (
            <div
                className={`flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white p-1 ${className}`}
                style={{ width: size, height: size }}
            >
                <QRCodeSVG value={config.qris_url} size={size - 8} />
            </div>
        );
    }

    if (config.qris_image) {
        return (
            <img
                src={`/storage/${config.qris_image}`}
                alt={config.name}
                className={`rounded-lg border border-gray-100 object-contain ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    return null;
}
