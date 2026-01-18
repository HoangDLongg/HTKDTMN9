/**
 * HTX Seasons Management Page
 * Quản lý vụ mùa trong HTX
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Search, Calendar, Eye, Plus, X } from 'lucide-react';

interface Season {
    id: number;
    season_code: string;
    farm: {
        id: number;
        name: string;
    };
    crop: {
        id: number;
        name: string;
    };
    start_date: string;
    expected_harvest_date: string;
    actual_yield: number | null;
    expected_yield: number | null;
    status: string;
}

interface Farm {
    id: number;
    name: string;
}

interface Crop {
    id: number;
    name: string;
}

interface Process {
    id: number;
    name: string;
}

export default function HTXSeasonsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [seasons, setSeasons] = useState<Season[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        farm_id: '',
        crop_id: '',
        process_id: '',
        start_date: '',
        area_planted: ''
    });

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

            const [seasonsRes, farmsRes, cropsRes, processesRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/seasons/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/farms/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/crops/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/technical-processes/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const seasonsData = await seasonsRes.json();
            const farmsData = await farmsRes.json();
            const cropsData = await cropsRes.json();
            const processesData = await processesRes.json();

            console.log('Farms data:', farmsData);
            console.log('Crops data:', cropsData);
            console.log('Processes data:', processesData);

            setSeasons(Array.isArray(seasonsData) ? seasonsData : seasonsData.results || []);
            setFarms(Array.isArray(farmsData) ? farmsData : farmsData.results || []);
            setCrops(Array.isArray(cropsData) ? cropsData : cropsData.results || []);
            setProcesses(Array.isArray(processesData) ? processesData : processesData.results || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSeasons = Array.isArray(seasons) ? seasons.filter(s => {
        const matchSearch = !searchQuery ||
            s.season_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.farm?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.crop?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = statusFilter === 'all' || s.status === statusFilter;

        return matchSearch && matchStatus;
    }) : [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'planning': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">📋 Lên kế hoạch</span>;
            case 'in_progress': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">🌱 Đang trồng</span>;
            case 'harvesting': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">🌾 Thu hoạch</span>;
            case 'completed': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✅ Hoàn thành</span>;
            default: return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://127.0.0.1:8000/api/seasons/create_with_timeline/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    farm_id: parseInt(formData.farm_id),
                    crop_id: parseInt(formData.crop_id),
                    process_id: parseInt(formData.process_id),
                    start_date: formData.start_date,
                    area_planted: parseFloat(formData.area_planted)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create season');
            }

            alert('✅ Tạo vụ mùa thành công!');
            setShowCreateModal(false);
            setFormData({ farm_id: '', crop_id: '', process_id: '', start_date: '', area_planted: '' });
            loadData();
        } catch (error: any) {
            console.error('Failed to create season:', error);
            alert(`❌ ${error.message || 'Không thể tạo vụ mùa'}`);
        } finally {
            setSubmitting(false);
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
                title="🗓️ Quản lý vụ mùa"
                subtitle="Theo dõi vụ mùa trong hợp tác xã"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Header with Create Button */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Danh sách vụ mùa</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm vụ mùa
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{seasons.length}</div>
                        <div className="text-gray-600">Tổng vụ mùa</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {seasons.filter(s => s.status === 'in_progress').length}
                        </div>
                        <div className="text-gray-600">Đang trồng</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                            {seasons.filter(s => s.status === 'harvesting').length}
                        </div>
                        <div className="text-gray-600">Thu hoạch</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">
                            {seasons.filter(s => s.status === 'completed').length}
                        </div>
                        <div className="text-gray-600">Hoàn thành</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm vụ mùa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="planning">Lên kế hoạch</option>
                            <option value="in_progress">Đang trồng</option>
                            <option value="harvesting">Thu hoạch</option>
                            <option value="completed">Hoàn thành</option>
                        </select>
                    </div>
                </div>

                {/* Seasons List */}
                <div className="space-y-4">
                    {filteredSeasons.map((season) => (
                        <div key={season.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-bold text-gray-900">{season.season_code}</h3>
                                        {getStatusBadge(season.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500">Vườn</div>
                                            <div className="font-medium text-gray-900">{season.farm?.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Cây trồng</div>
                                            <div className="font-medium text-gray-900">{season.crop?.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Thời gian</div>
                                            <div className="font-medium text-gray-900">
                                                {new Date(season.start_date).toLocaleDateString('vi-VN')} → {new Date(season.expected_harvest_date).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    {season.actual_yield && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="text-sm text-gray-500">Sản lượng</div>
                                            <div className="text-lg font-bold text-green-600">{season.actual_yield} tấn</div>
                                        </div>
                                    )}
                                </div>

                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition ml-4">
                                    <Eye className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSeasons.length === 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">🗓️</div>
                        <p className="text-gray-500">Không tìm thấy vụ mùa nào</p>
                    </div>
                )}
            </main>

            {/* Create Season Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-900">Thêm vụ mùa mới</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trang trại *
                                </label>
                                <select
                                    required
                                    value={formData.farm_id}
                                    onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Chọn trang trại</option>
                                    {farms.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cây trồng *
                                </label>
                                <select
                                    required
                                    value={formData.crop_id}
                                    onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Chọn cây trồng</option>
                                    {crops.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quy trình kỹ thuật *
                                </label>
                                <select
                                    required
                                    value={formData.process_id}
                                    onChange={(e) => setFormData({ ...formData, process_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Chọn quy trình</option>
                                    {processes.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày bắt đầu *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diện tích (ha) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.area_planted}
                                    onChange={(e) => setFormData({ ...formData, area_planted: e.target.value })}
                                    placeholder="Ví dụ: 2.5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Đang tạo...' : 'Tạo vụ mùa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}