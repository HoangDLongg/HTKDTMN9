/**
 * Admin Crops Management Page
 * Quản lý cây trồng
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Pencil, Trash2, Plus, Search, Leaf, X } from 'lucide-react';

interface Crop {
    id: number;
    name: string;
    scientific_name: string | null;
    category: string | null;
    description: string | null;
    growing_season_days: number | null;
    created_at: string;
}

const CATEGORIES = [
    { value: 'vegetable', label: '🥬 Rau' },
    { value: 'fruit', label: '🍎 Quả' },
    { value: 'grain', label: '🌾 Ngũ cốc' },
    { value: 'tuber', label: '🥔 Củ' },
    { value: 'spice', label: '🌶️ Gia vị' },
    { value: 'other', label: '🌿 Khác' }
];

export default function AdminCropsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        scientific_name: '',
        category: '',
        description: '',
        growing_season_days: ''
    });

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

            const response = await fetch('http://127.0.0.1:8000/api/crops/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setCrops(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load crops:', error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const payload = {
                ...formData,
                growing_season_days: formData.growing_season_days ? parseInt(formData.growing_season_days) : null
            };

            const response = await fetch('http://127.0.0.1:8000/api/crops/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create crop');

            alert('✅ Tạo cây trồng thành công!');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to create crop:', error);
            alert('❌ Không thể tạo cây trồng');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCrop) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const payload = {
                ...formData,
                growing_season_days: formData.growing_season_days ? parseInt(formData.growing_season_days) : null
            };

            const response = await fetch(`http://127.0.0.1:8000/api/crops/${selectedCrop.id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to update crop');

            alert('✅ Cập nhật thành công!');
            setShowEditModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to update crop:', error);
            alert('❌ Không thể cập nhật');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCrop) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/crops/${selectedCrop.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete crop');

            alert('✅ Xóa cây trồng thành công!');
            setShowDeleteModal(false);
            setSelectedCrop(null);
            loadData();
        } catch (error) {
            console.error('Failed to delete crop:', error);
            alert('❌ Không thể xóa cây trồng');
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (crop: Crop) => {
        setSelectedCrop(crop);
        setFormData({
            name: crop.name,
            scientific_name: crop.scientific_name || '',
            category: crop.category || '',
            description: crop.description || '',
            growing_season_days: crop.growing_season_days?.toString() || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (crop: Crop) => {
        setSelectedCrop(crop);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            scientific_name: '',
            category: '',
            description: '',
            growing_season_days: ''
        });
        setSelectedCrop(null);
    };

    const filteredCrops = Array.isArray(crops) ? crops.filter(c => {
        const matchSearch = !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;

        return matchSearch && matchCategory;
    }) : [];

    const getCategoryLabel = (category: string | null) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat ? cat.label : category || 'Chưa phân loại';
    };

    const getCategoryColor = (category: string | null) => {
        switch (category) {
            case 'vegetable': return 'bg-green-100 text-green-800';
            case 'fruit': return 'bg-red-100 text-red-800';
            case 'grain': return 'bg-yellow-100 text-yellow-800';
            case 'tuber': return 'bg-orange-100 text-orange-800';
            case 'spice': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                title="🌱 Quản lý cây trồng"
                subtitle="Quản lý danh mục cây trồng trong hệ thống"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">{crops.length}</div>
                        <div className="text-gray-600">Tổng cây trồng</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {crops.filter(c => c.category === 'fruit').length}
                        </div>
                        <div className="text-gray-600">Cây ăn quả</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">
                            {crops.filter(c => c.category === 'vegetable').length}
                        </div>
                        <div className="text-gray-600">Rau củ</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-amber-600 mb-2">
                            {crops.filter(c => c.category === 'grain').length}
                        </div>
                        <div className="text-gray-600">Ngũ cốc</div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên cây trồng, tên khoa học..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả loại</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={openCreateModal}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm cây trồng
                        </button>
                    </div>
                </div>

                {/* Crops Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cây trồng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khoa học</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian trồng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCrops.map((crop) => (
                                    <tr key={crop.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Leaf className="w-5 h-5 text-green-600 mr-2" />
                                                <div className="font-medium text-gray-900">{crop.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 italic">{crop.scientific_name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(crop.category)}`}>
                                                {getCategoryLabel(crop.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {crop.growing_season_days ? `${crop.growing_season_days} ngày` : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                {crop.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(crop)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Sửa"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(crop)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCrops.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">🌱</div>
                            <p className="text-gray-500">Không tìm thấy cây trồng nào</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Thêm cây trồng mới</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên cây trồng *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="VD: Cà chua"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoa học</label>
                                    <input
                                        type="text"
                                        value={formData.scientific_name}
                                        onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="VD: Solanum lycopersicum"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại cây trồng</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">-- Chọn loại --</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian trồng (ngày)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.growing_season_days}
                                        onChange={(e) => setFormData({ ...formData, growing_season_days: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="VD: 90"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Mô tả về cây trồng..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo cây trồng'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCrop && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Sửa cây trồng</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên cây trồng *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoa học</label>
                                    <input
                                        type="text"
                                        value={formData.scientific_name}
                                        onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại cây trồng</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">-- Chọn loại --</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian trồng (ngày)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.growing_season_days}
                                        onChange={(e) => setFormData({ ...formData, growing_season_days: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCrop && (
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
                                    Bạn có chắc chắn muốn xóa cây trồng này?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-medium text-gray-900">{selectedCrop.name}</div>
                                    {selectedCrop.scientific_name && (
                                        <div className="text-sm text-gray-500 italic">{selectedCrop.scientific_name}</div>
                                    )}
                                    <div className="text-sm text-gray-500">{getCategoryLabel(selectedCrop.category)}</div>
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
                                    {submitting ? 'Đang xóa...' : 'Xóa cây trồng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
