/**
 * Admin Seasons Management Page - ENHANCED
 * Quản lý vụ mùa với đầy đủ chức năng và filters
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Search, Calendar, Eye, Plus, Pencil, Trash2, X, Filter } from 'lucide-react';

interface Season {
    id: number;
    season_code: string;
    farm: {
        id: number;
        name: string;
        area_hectare: number;
    };
    crop: {
        id: number;
        name: string;
    };
    start_date: string;
    expected_harvest_date: string;
    actual_harvest_date: string | null;
    expected_yield: number | null;
    actual_yield: number | null;
    status: string;
    created_at: string;
}

interface Farm {
    id: number;
    name: string;
    area_hectare: number;
}

interface Crop {
    id: number;
    name: string;
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'planning', label: '📋 Lên kế hoạch' },
    { value: 'in_progress', label: '🌱 Đang trồng' },
    { value: 'harvesting', label: '🌾 Thu hoạch' },
    { value: 'completed', label: '✅ Hoàn thành' },
    { value: 'cancelled', label: '❌ Hủy bỏ' }
];

export default function AdminSeasonsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [seasons, setSeasons] = useState<Season[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [cropFilter, setCropFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && !isAdmin) {
            router.push('/dashboard');
        } else if (user && isAdmin) {
            loadData();
        }
    }, [user, authLoading, isAdmin]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const [seasonsRes, farmsRes, cropsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/seasons/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/farms/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/crops/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const seasonsData = await seasonsRes.json();
            const farmsData = await farmsRes.json();
            const cropsData = await cropsRes.json();

            setSeasons(Array.isArray(seasonsData) ? seasonsData : seasonsData.results || []);
            setFarms(Array.isArray(farmsData) ? farmsData : farmsData.results || []);
            setCrops(Array.isArray(cropsData) ? cropsData : cropsData.results || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSeason) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/seasons/${selectedSeason.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete season');

            alert('✅ Xóa vụ mùa thành công!');
            setShowDeleteModal(false);
            setSelectedSeason(null);
            loadData();
        } catch (error) {
            console.error('Failed to delete season:', error);
            alert('❌ Không thể xóa vụ mùa');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSeasons = Array.isArray(seasons) ? seasons.filter(s => {
        const matchSearch = !searchQuery ||
            s.season_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.farm?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.crop?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        const matchCrop = cropFilter === 'all' || s.crop?.id?.toString() === cropFilter;

        let matchDate = true;
        if (dateFilter !== 'all') {
            const now = new Date();
            const startDate = new Date(s.start_date);

            switch (dateFilter) {
                case 'this_month':
                    matchDate = startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
                    break;
                case 'last_month':
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                    matchDate = startDate.getMonth() === lastMonth.getMonth() && startDate.getFullYear() === lastMonth.getFullYear();
                    break;
                case 'this_year':
                    matchDate = startDate.getFullYear() === now.getFullYear();
                    break;
            }
        }

        return matchSearch && matchStatus && matchCrop && matchDate;
    }) : [];

    // Calculate real stats
    const totalArea = filteredSeasons.reduce((sum, s) => sum + (s.farm.area_hectare || 0), 0);
    const completedSeasons = filteredSeasons.filter(s => s.status === 'completed' && s.actual_yield);
    const avgYieldPerHa = completedSeasons.length > 0
        ? completedSeasons.reduce((sum, s) => sum + (s.actual_yield || 0) / s.farm.area_hectare, 0) / completedSeasons.length
        : 0;
    const completionRate = filteredSeasons.length > 0
        ? (filteredSeasons.filter(s => s.status === 'completed').length / filteredSeasons.length) * 100
        : 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'planning':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">📋 Lên kế hoạch</span>;
            case 'in_progress':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">🌱 Đang trồng</span>;
            case 'harvesting':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">🌾 Thu hoạch</span>;
            case 'completed':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">✅ Hoàn thành</span>;
            case 'cancelled':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">❌ Hủy bỏ</span>;
            default:
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const calculateProgress = (season: Season) => {
        const start = new Date(season.start_date);
        const end = new Date(season.expected_harvest_date);
        const now = new Date();

        const total = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();

        const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
        return Math.round(progress);
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
                title="🗓️ Quản lý vụ mùa"
                subtitle="Theo dõi tất cả vụ mùa trong hệ thống"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{filteredSeasons.length}</div>
                        <div className="text-gray-600">Tổng vụ mùa</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {filteredSeasons.filter(s => s.status === 'in_progress').length}
                        </div>
                        <div className="text-gray-600">Đang trồng</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                            {filteredSeasons.filter(s => s.status === 'harvesting').length}
                        </div>
                        <div className="text-gray-600">Thu hoạch</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">
                            {filteredSeasons.filter(s => s.status === 'completed').length}
                        </div>
                        <div className="text-gray-600">Hoàn thành</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {filteredSeasons.reduce((sum, s) => sum + (s.actual_yield || 0), 0).toFixed(1)}
                        </div>
                        <div className="text-gray-600">Tổng sản lượng (tấn)</div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm mã vụ mùa, vườn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={cropFilter}
                                onChange={(e) => setCropFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả cây trồng</option>
                                {crops.map(crop => (
                                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="this_month">Tháng này</option>
                                <option value="last_month">Tháng trước</option>
                                <option value="this_year">Năm nay</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seasons Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vụ mùa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vườn</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cây trồng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diện tích</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiến độ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản lượng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSeasons.map((season) => {
                                    const progress = calculateProgress(season);
                                    return (
                                        <tr key={season.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                                                    <div className="font-medium text-gray-900">{season.season_code}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{season.farm.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{season.crop.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{season.farm.area_hectare} ha</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(season.start_date).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    → {new Date(season.expected_harvest_date).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500">{progress}%</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {season.actual_yield ? `${season.actual_yield} tấn` : '-'}
                                                </div>
                                                {season.expected_yield && (
                                                    <div className="text-xs text-gray-500">
                                                        DK: {season.expected_yield} tấn
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(season.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSeason(season);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredSeasons.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">🗓️</div>
                            <p className="text-gray-500">Không tìm thấy vụ mùa nào</p>
                        </div>
                    )}
                </div>

                {/* Summary Stats - REAL DATA */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Tổng diện tích canh tác</div>
                        <div className="text-3xl font-bold">{totalArea.toFixed(1)}</div>
                        <div className="text-sm opacity-75 mt-1">hecta ({filteredSeasons.length} vụ)</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Năng suất trung bình</div>
                        <div className="text-3xl font-bold">{avgYieldPerHa.toFixed(1)}</div>
                        <div className="text-sm opacity-75 mt-1">tấn/hecta ({completedSeasons.length} vụ hoàn thành)</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Tỷ lệ hoàn thành</div>
                        <div className="text-3xl font-bold">{completionRate.toFixed(1)}%</div>
                        <div className="text-sm opacity-75 mt-1">
                            {filteredSeasons.filter(s => s.status === 'completed').length}/{filteredSeasons.length} vụ
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Modal */}
            {showDeleteModal && selectedSeason && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-red-600">Xác nhận xóa</h2>
                                <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    Bạn có chắc chắn muốn xóa vụ mùa này?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-medium text-gray-900">{selectedSeason.season_code}</div>
                                    <div className="text-sm text-gray-500">Vườn: {selectedSeason.farm.name}</div>
                                    <div className="text-sm text-gray-500">Cây trồng: {selectedSeason.crop.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(selectedSeason.start_date).toLocaleDateString('vi-VN')} → {new Date(selectedSeason.expected_harvest_date).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                <p className="text-red-600 text-sm mt-4">
                                    ⚠️ Hành động này không thể hoàn tác!
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Đang xóa...' : 'Xóa vụ mùa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
