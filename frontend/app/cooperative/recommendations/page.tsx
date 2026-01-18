/**
 * HTX Recommendations Page
 * Đề xuất cây trồng cho nông dân
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Lightbulb, TrendingUp, Calendar } from 'lucide-react';

interface Recommendation {
    id: number;
    farmer: {
        id: number;
        user: {
            full_name: string;
            username: string;
        };
    };
    crop: {
        id: number;
        name: string;
    };
    recommended_date: string;
    reason: string | null;
    status: string;
    created_at: string;
}

export default function HTXRecommendationsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
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

            const response = await fetch('http://127.0.0.1:8000/api/planting-recommendations/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setRecommendations(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">⏳ Chờ xử lý</span>;
            case 'accepted':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✅ Đã chấp nhận</span>;
            case 'rejected':
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">❌ Từ chối</span>;
            default:
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="💡 Đề xuất cây trồng"
                subtitle="Gợi ý cây trồng phù hợp cho nông dân"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{recommendations.length}</div>
                        <div className="text-gray-600">Tổng đề xuất</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                            {recommendations.filter(r => r.status === 'pending').length}
                        </div>
                        <div className="text-gray-600">Chờ xử lý</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {recommendations.filter(r => r.status === 'accepted').length}
                        </div>
                        <div className="text-gray-600">Đã chấp nhận</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {recommendations.filter(r => r.status === 'rejected').length}
                        </div>
                        <div className="text-gray-600">Từ chối</div>
                    </div>
                </div>

                {/* Recommendations List */}
                <div className="space-y-4">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Lightbulb className="w-6 h-6 text-purple-600" />
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Đề xuất trồng {rec.crop?.name}
                                        </h3>
                                        {getStatusBadge(rec.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <div className="text-sm text-gray-500">Nông dân</div>
                                            <div className="font-medium text-gray-900">
                                                {rec.farmer?.user?.full_name || rec.farmer?.user?.username}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Ngày đề xuất</div>
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(rec.recommended_date).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    {rec.reason && (
                                        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                            <div className="text-sm text-gray-500 mb-1">Lý do</div>
                                            <div className="text-sm text-gray-700">{rec.reason}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-4">
                                    <TrendingUp className="w-8 h-8 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {recommendations.length === 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">💡</div>
                        <p className="text-gray-500 mb-2">Chưa có đề xuất nào</p>
                        <p className="text-sm text-gray-400">Hệ thống sẽ tự động tạo đề xuất dựa trên dữ liệu thị trường</p>
                    </div>
                )}
            </main>
        </div>
    );
}
