'use client';

import { useEffect, useRef } from 'react';

interface MetabaseDashboardProps {
    /**
     * URL của Metabase dashboard (internal link)
     * Ví dụ: "http://localhost:3001/dashboard/1"
     */
    dashboardUrl: string;

    /**
     * Chiều cao của iframe (default: 800px)
     */
    height?: number;

    /**
     * Parameters để filter dashboard
     * Ví dụ: { user_id: 3, farm_id: 5 }
     */
    params?: Record<string, any>;

    /**
     * Tiêu đề hiển thị
     */
    title?: string;
}

export default function MetabaseDashboard({
    dashboardUrl,
    height = 800,
    params = {},
    title
}: MetabaseDashboardProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Build URL with parameters
    const buildUrl = () => {
        const url = new URL(dashboardUrl);

        // Add parameters to URL
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
        });

        // Add embed mode (nếu Metabase hỗ trợ)
        // url.searchParams.set('embed', 'true');

        return url.toString();
    };

    useEffect(() => {
        // Reload iframe when params change
        if (iframeRef.current) {
            iframeRef.current.src = buildUrl();
        }
    }, [params, dashboardUrl]);

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {title && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>
            )}

            <div className="relative" style={{ height: `${height}px` }}>
                <iframe
                    ref={iframeRef}
                    src={buildUrl()}
                    className="w-full h-full border-0"
                    title={title || 'Metabase Dashboard'}
                    allow="fullscreen"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />

                {/* Loading overlay */}
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải dashboard...</p>
                    </div>
                </div>
            </div>

            {/* Info footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    📊 Dữ liệu được cập nhật real-time từ Metabase
                </p>
            </div>
        </div>
    );
}
