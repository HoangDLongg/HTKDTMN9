/**
 * Admin Reports Page
 * Báo cáo tổng hợp và thống kê
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { TrendingUp, Users, Building2, Leaf, Calendar, DollarSign } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalCooperatives: number;
    totalFarms: number;
    totalCrops: number;
    totalSeasons: number;
    activeSeasons: number;
    completedSeasons: number;
    totalYield: number;
    avgYield: number;
}

export default function AdminReportsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalCooperatives: 0,
        totalFarms: 0,
        totalCrops: 0,
        totalSeasons: 0,
        activeSeasons: 0,
        completedSeasons: 0,
        totalYield: 0,
        avgYield: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && !isAdmin) {
            router.push('/dashboard');
        } else if (user && isAdmin) {
            loadStats();
        }
    }, [user, authLoading, isAdmin]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const [usersRes, coopsRes, farmsRes, cropsRes, seasonsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/users/', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/api/cooperatives/', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/api/farms/', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/api/crops/', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/api/seasons/', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const users = await usersRes.json();
            const coops = await coopsRes.json();
            const farms = await farmsRes.json();
            const crops = await cropsRes.json();
            const seasons = await seasonsRes.json();

            const usersData = Array.isArray(users) ? users : users.results || [];
            const coopsData = Array.isArray(coops) ? coops : coops.results || [];
            const farmsData = Array.isArray(farms) ? farms : farms.results || [];
            const cropsData = Array.isArray(crops) ? crops : crops.results || [];
            const seasonsData = Array.isArray(seasons) ? seasons : seasons.results || [];

            const completedSeasons = seasonsData.filter((s: any) => s.status === 'completed' && s.actual_yield);
            const totalYield = seasonsData.reduce((sum: number, s: any) => sum + (s.actual_yield || 0), 0);
            const avgYield = completedSeasons.length > 0 ? totalYield / completedSeasons.length : 0;

            setStats({
                totalUsers: usersData.length,
                totalCooperatives: coopsData.length,
                totalFarms: farmsData.length,
                totalCrops: cropsData.length,
                totalSeasons: seasonsData.length,
                activeSeasons: seasonsData.filter((s: any) => s.status === 'in_progress').length,
                completedSeasons: completedSeasons.length,
                totalYield,
                avgYield
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="📊 Báo cáo & Thống kê"
                subtitle="Tổng quan hoạt động hệ thống"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-2">Tổng người dùng</div>
                                <div className="text-4xl font-bold">{stats.totalUsers}</div>
                            </div>
                            <Users className="w-16 h-16 opacity-50" />
                        </div>
                        <div className="text-sm opacity-75">Đang hoạt động trong hệ thống</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-2">Hợp tác xã</div>
                                <div className="text-4xl font-bold">{stats.totalCooperatives}</div>
                            </div>
                            <Building2 className="w-16 h-16 opacity-50" />
                        </div>
                        <div className="text-sm opacity-75">Đang quản lý</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-2">Vườn canh tác</div>
                                <div className="text-4xl font-bold">{stats.totalFarms}</div>
                            </div>
                            <Leaf className="w-16 h-16 opacity-50" />
                        </div>
                        <div className="text-sm opacity-75">Đang theo dõi</div>
                    </div>
                </div>

                {/* Crops & Seasons */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Leaf className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalCrops}</div>
                                <div className="text-sm text-gray-600">Cây trồng</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalSeasons}</div>
                                <div className="text-sm text-gray-600">Tổng vụ mùa</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stats.activeSeasons}</div>
                                <div className="text-sm text-gray-600">Đang trồng</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-emerald-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stats.completedSeasons}</div>
                                <div className="text-sm text-gray-600">Hoàn thành</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Production Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Sản lượng</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Tổng sản lượng</div>
                                    <div className="text-3xl font-bold text-green-600">{stats.totalYield.toFixed(1)}</div>
                                    <div className="text-sm text-gray-500">tấn</div>
                                </div>
                                <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Năng suất trung bình</div>
                                    <div className="text-3xl font-bold text-blue-600">{stats.avgYield.toFixed(1)}</div>
                                    <div className="text-sm text-gray-500">tấn/vụ</div>
                                </div>
                                <TrendingUp className="w-12 h-12 text-blue-600 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Hiệu suất</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {stats.totalSeasons > 0
                                            ? ((stats.completedSeasons / stats.totalSeasons) * 100).toFixed(1)
                                            : 0
                                        }%
                                    </div>
                                </div>
                                <div className="w-full bg-purple-200 rounded-full h-3">
                                    <div
                                        className="bg-purple-600 h-3 rounded-full transition-all"
                                        style={{
                                            width: `${stats.totalSeasons > 0
                                                ? (stats.completedSeasons / stats.totalSeasons) * 100
                                                : 0
                                                }%`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {stats.completedSeasons} / {stats.totalSeasons} vụ
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-gray-600">Vụ đang hoạt động</div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {stats.totalSeasons > 0
                                            ? ((stats.activeSeasons / stats.totalSeasons) * 100).toFixed(1)
                                            : 0
                                        }%
                                    </div>
                                </div>
                                <div className="w-full bg-orange-200 rounded-full h-3">
                                    <div
                                        className="bg-orange-600 h-3 rounded-full transition-all"
                                        style={{
                                            width: `${stats.totalSeasons > 0
                                                ? (stats.activeSeasons / stats.totalSeasons) * 100
                                                : 0
                                                }%`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {stats.activeSeasons} / {stats.totalSeasons} vụ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🔗 Truy cập nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <a href="/admin/users" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center">
                            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <div className="font-medium text-gray-900">Người dùng</div>
                        </a>
                        <a href="/admin/cooperatives" className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center">
                            <Building2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <div className="font-medium text-gray-900">Hợp tác xã</div>
                        </a>
                        <a href="/admin/crops" className="p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition text-center">
                            <Leaf className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                            <div className="font-medium text-gray-900">Cây trồng</div>
                        </a>
                        <a href="/admin/seasons" className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center">
                            <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <div className="font-medium text-gray-900">Vụ mùa</div>
                        </a>
                        <a href="/admin/market" className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center">
                            <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                            <div className="font-medium text-gray-900">Thị trường</div>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );//vi trung
}
