/**
 * Farmer Analytics Page - Thống kê & Báo cáo
 * Tích hợp Metabase dashboards
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import MetabaseDashboard from '@/components/MetabaseDashboard';
import { getFarmerByUserId } from '@/lib/farms-service';
import type { Farmer } from '@/types';

export default function FarmerAnalyticsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [farmer, setFarmer] = useState<Farmer | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDashboard, setSelectedDashboard] = useState<'overview' | 'farms' | 'market' | 'tasks'>('overview');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadFarmerData();
        }
    }, [user, authLoading]);

    const loadFarmerData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const farmerData = await getFarmerByUserId(user.id);
            setFarmer(farmerData);
        } catch (err: any) {
            console.error('Failed to load farmer data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Metabase URL - Sử dụng URL thật của bạn
    const METABASE_BASE_URL = 'http://localhost:3001';

    const dashboards = {
        overview: {
            title: '📊 Tổng quan',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Dashboard thật của bạn
            description: 'Thống kê tổng quan về vườn, vụ mùa và năng suất'
        },
        farms: {
            title: '🏡 Vườn của tôi',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung, sau này tạo dashboard riêng
            description: 'Chi tiết các vườn canh tác và diện tích'
        },
        market: {
            title: '💰 Giá thị trường',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung
            description: 'Biểu đồ giá cả và xu hướng thị trường'
        },
        tasks: {
            title: '✅ Công việc',
            url: `${METABASE_BASE_URL}/public/dashboard/07dfc4bc-3ab6-4716-aca8-58b43203e3ac`, // Tạm dùng chung
            description: 'Tiến độ công việc và lịch sử hoàn thành'
        }
    };

    const currentDashboard = dashboards[selectedDashboard];

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="📈 Thống kê & Báo cáo"
                subtitle={farmer ? `Mã nông dân: ${farmer.farmer_code}` : undefined}
            />

            <main className="container mx-auto px-4 py-8">
                {/* Dashboard Selector */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Chọn báo cáo</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Object.entries(dashboards).map(([key, dash]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDashboard(key as any)}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedDashboard === key
                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{dash.title.split(' ')[0]}</div>
                                <div className="font-semibold text-gray-900 mb-1">
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
                        farmer_id: farmer?.id
                    }}
                />

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Hướng dẫn sử dụng</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li>• <strong>Tổng quan:</strong> Xem thống kê chung về vườn và vụ mùa</li>
                        <li>• <strong>Vườn của tôi:</strong> Chi tiết từng vườn canh tác</li>
                        <li>• <strong>Giá thị trường:</strong> Theo dõi biến động giá cả</li>
                        <li>• <strong>Công việc:</strong> Tiến độ hoàn thành công việc hàng ngày</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
