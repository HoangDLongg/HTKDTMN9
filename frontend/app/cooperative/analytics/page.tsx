/**
 * Cooperative Analytics Page - Thống kê & Báo cáo HTX
 * Tích hợp Metabase dashboards cho quản lý HTX
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import MetabaseDashboard from '@/components/MetabaseDashboard';

export default function CooperativeAnalyticsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isCooperative } = useAuth();

    const [selectedDashboard, setSelectedDashboard] = useState<'overview' | 'farmers' | 'production' | 'market' | 'quality'>('overview');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && !isCooperative) {
            router.push('/dashboard');
        }
    }, [user, authLoading, isCooperative]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Metabase URL - Sử dụng URL thật của bạn
    const METABASE_BASE_URL = 'http://localhost:3001';

    const dashboards = {
        overview: {
            title: '📊 Tổng quan HTX',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Dashboard thật
            description: 'Thống kê tổng quan sản xuất, nông dân và doanh thu',
            icon: '📊'
        },
        farmers: {
            title: '👨‍🌾 Quản lý nông dân',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung
            description: 'Danh sách nông dân, vườn và tiến độ canh tác',
            icon: '👨‍🌾'
        },
        production: {
            title: '🌾 Sản xuất',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung
            description: 'Sản lượng, diện tích và năng suất theo cây trồng',
            icon: '🌾'
        },
        market: {
            title: '💰 Thị trường',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung
            description: 'Phân tích giá cả, xu hướng và dự báo thị trường',
            icon: '💰'
        },
        quality: {
            title: '⭐ Chất lượng',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung
            description: 'Đánh giá chất lượng sản phẩm và tuân thủ quy trình',
            icon: '⭐'
        }
    };

    const currentDashboard = dashboards[selectedDashboard];

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="📈 Thống kê & Báo cáo HTX"
                subtitle="Quản lý và phân tích hoạt động hợp tác xã"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-3xl mb-2">👨‍🌾</div>
                        <div className="text-2xl font-bold mb-1">-</div>
                        <div className="text-sm opacity-90">Tổng nông dân</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-3xl mb-2">🏡</div>
                        <div className="text-2xl font-bold mb-1">-</div>
                        <div className="text-sm opacity-90">Tổng vườn</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-3xl mb-2">🌾</div>
                        <div className="text-2xl font-bold mb-1">-</div>
                        <div className="text-sm opacity-90">Vụ mùa đang trồng</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-2xl font-bold mb-1">-</div>
                        <div className="text-sm opacity-90">Sản lượng (tấn)</div>
                    </div>
                </div>

                {/* Dashboard Selector */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Chọn báo cáo</h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(dashboards).map(([key, dash]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDashboard(key as any)}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedDashboard === key
                                    ? 'border-green-600 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{dash.icon}</div>
                                <div className="font-semibold text-gray-900 mb-1 text-sm">
                                    {dash.title.split(' ').slice(1).join(' ')}
                                </div>
                                <div className="text-xs text-gray-600">{dash.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Metabase Dashboard */}
                <MetabaseDashboard
                    dashboardUrl={currentDashboard.url}
                    title={currentDashboard.title}
                    height={900}
                    params={{
                        user_id: user?.id,
                        cooperative_id: user?.cooperative_id // Nếu có
                    }}
                />

                {/* Instructions */}
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-900 mb-3">💡 Hướng dẫn sử dụng</h3>
                    <ul className="space-y-2 text-green-800">
                        <li>• <strong>Tổng quan HTX:</strong> Xem thống kê chung về hoạt động HTX</li>
                        <li>• <strong>Quản lý nông dân:</strong> Theo dõi danh sách và tiến độ của từng nông dân</li>
                        <li>• <strong>Sản xuất:</strong> Phân tích sản lượng và năng suất theo cây trồng</li>
                        <li>• <strong>Thị trường:</strong> Theo dõi giá cả và xu hướng thị trường</li>
                        <li>• <strong>Chất lượng:</strong> Đánh giá chất lượng sản phẩm và quy trình</li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-green-300">
                        <p className="text-sm text-green-700">
                            <strong>📌 Lưu ý:</strong> Dữ liệu được cập nhật real-time từ database.
                            Bạn có thể tương tác với biểu đồ để xem chi tiết hơn.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
