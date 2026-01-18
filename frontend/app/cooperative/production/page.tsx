/**
 * HTX Production Stats Page
 * Thống kê sản lượng HTX
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { TrendingUp, Package, Leaf } from 'lucide-react';

interface Season {
    id: number;
    crop: { name: string };
    actual_yield: number | null;
    status: string;
}

export default function HTXProductionPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [seasons, setSeasons] = useState<Season[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadData();
        }
    }, [user, authLoading]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://127.0.0.1:8000/api/seasons/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setSeasons(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const completedSeasons = seasons.filter(s => s.status === 'completed' && s.actual_yield);
    const totalYield = seasons.reduce((sum, s) => sum + (s.actual_yield || 0), 0);
    const avgYield = completedSeasons.length > 0 ? totalYield / completedSeasons.length : 0;

    // Group by crop
    const yieldByCrop = seasons.reduce((acc, s) => {
        if (s.actual_yield) {
            const cropName = s.crop?.name || 'Khác';
            acc[cropName] = (acc[cropName] || 0) + s.actual_yield;
        }
        return acc;
    }, {} as Record<string, number>);

    const topCrops = Object.entries(yieldByCrop)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="📦 Thống kê sản lượng"
                subtitle="Tổng hợp sản lượng hợp tác xã"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-2">Tổng sản lượng</div>
                                <div className="text-4xl font-bold">{totalYield.toFixed(1)}</div>
                                <div className="text-sm opacity-75 mt-1">tấn</div>
                            </div>
                            <Package className="w-16 h-16 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-2">Năng suất TB</div>
                                <div className="text-4xl font-bold">{avgYield.toFixed(1)}</div>
                                <div className="text-sm opacity-75 mt-1">tấn/vụ</div>
                            </div>
                            <TrendingUp className="w-16 h-16 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-2">Vụ hoàn thành</div>
                                <div className="text-4xl font-bold">{completedSeasons.length}</div>
                                <div className="text-sm opacity-75 mt-1">vụ mùa</div>
                            </div>
                            <Leaf className="w-16 h-16 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Top Crops */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 cây trồng theo sản lượng</h2>

                    <div className="space-y-4">
                        {topCrops.map(([crop, cropYield], index) => {
                            const percentage = (cropYield / totalYield) * 100;
                            return (
                                <div key={crop}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-900">{crop}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">{cropYield.toFixed(1)} tấn</div>
                                            <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-green-600 h-3 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {topCrops.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có dữ liệu sản lượng
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
