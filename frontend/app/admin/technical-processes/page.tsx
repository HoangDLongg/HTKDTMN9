/**
 * Admin Technical Processes Management Page
 * Quản lý quy trình kỹ thuật canh tác
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Plus, Edit, Trash2, Search, FileText, Calendar, Leaf } from 'lucide-react';

interface TechnicalProcess {
    id: number;
    name: string;
    crop: number;
    crop_name?: string;
    total_days: number;
    standard_type: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

interface Crop {
    id: number;
    name: string;
    code: string;
}

export default function AdminTechnicalProcessesPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [processes, setProcesses] = useState<TechnicalProcess[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<TechnicalProcess | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        crop: '',
        total_days: '',
        standard_type: '',
        description: '',
        is_active: true
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

            const [processesRes, cropsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/technical-processes/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/crops/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const processesData = await processesRes.json();
            const cropsData = await cropsRes.json();

            const processesArray = Array.isArray(processesData) ? processesData : processesData.results || [];
            const cropsArray = Array.isArray(cropsData) ? cropsData : cropsData.results || [];

            // Map crop names to processes
            const enrichedProcesses = processesArray.map((proc: TechnicalProcess) => ({
                ...proc,
                crop_name: cropsArray.find((c: Crop) => c.id === proc.crop)?.name || 'N/A'
            }));

            setProcesses(enrichedProcesses);
            setCrops(cropsArray);
        } catch (error) {
            console.error('Failed to load data:', error);
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
                name: formData.name,
                crop: parseInt(formData.crop),
                total_days: parseInt(formData.total_days),
                standard_type: formData.standard_type || null,
                description: formData.description || null,
                is_active: formData.is_active
            };

            const response = await fetch('http://127.0.0.1:8000/api/technical-processes/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create');

            alert('Tạo quy trình thành công!');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            alert('Lỗi khi tạo quy trình');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProcess) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const payload = {
                name: formData.name,
                crop: parseInt(formData.crop),
                total_days: parseInt(formData.total_days),
                standard_type: formData.standard_type || null,
                description: formData.description || null,
                is_active: formData.is_active
            };

            const response = await fetch(`http://127.0.0.1:8000/api/technical-processes/${selectedProcess.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to update');

            alert('Cập nhật thành công!');
            setShowEditModal(false);
            setSelectedProcess(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Update error:', error);
            alert('Lỗi khi cập nhật');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (process: TechnicalProcess) => {
        if (!confirm(`Xóa quy trình "${process.name}"?`)) return;

        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/technical-processes/${process.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete');

            alert('Xóa thành công!');
            loadData();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Lỗi khi xóa quy trình');
        }
    };

    const openEditModal = (process: TechnicalProcess) => {
        setSelectedProcess(process);
        setFormData({
            name: process.name,
            crop: process.crop.toString(),
            total_days: process.total_days.toString(),
            standard_type: process.standard_type || '',
            description: process.description || '',
            is_active: process.is_active
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            crop: '',
            total_days: '',
            standard_type: '',
            description: '',
            is_active: true
        });
    };

    const filteredProcesses = processes.filter(proc =>
        proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proc.crop_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                title="⚙️ Quy trình kỹ thuật"
                subtitle="Quản lý quy trình canh tác"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Search & Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm quy trình..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={() => {
                                resetForm();
                                setShowCreateModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm quy trình
                        </button>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        <FileText className="w-4 h-4 inline mr-2" />
                        {filteredProcesses.length} quy trình
                    </div>
                </div>

                {/* Processes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProcesses.map((process) => (
                        <div key={process.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{process.name}</h3>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Leaf className="w-4 h-4" />
                                            <span>{process.crop_name}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        process.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {process.is_active ? 'Hoạt động' : 'Tạm dừng'}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Thời gian</div>
                                        <div className="font-bold text-gray-900">{process.total_days} ngày</div>
                                    </div>
                                </div>

                                {process.standard_type && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">Tiêu chuẩn:</span>
                                        <span className="ml-2 font-medium">{process.standard_type}</span>
                                    </div>
                                )}

                                {process.description && (
                                    <p className="text-sm text-gray-600 line-clamp-3">{process.description}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 border-t flex gap-2">
                                <button
                                    onClick={() => openEditModal(process)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Edit className="w-4 h-4" />
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(process)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProcesses.length === 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">⚙️</div>
                        <p className="text-gray-500">Chưa có quy trình nào</p>
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Thêm quy trình kỹ thuật</h2>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên quy trình <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="VD: Quy trình trồng dưa lưới VietGAP"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cây trồng <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.crop}
                                    onChange={(e) => setFormData({...formData, crop: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">-- Chọn cây trồng --</option>
                                    {crops.map(crop => (
                                        <option key={crop.id} value={crop.id}>{crop.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tổng số ngày <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.total_days}
                                    onChange={(e) => setFormData({...formData, total_days: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="VD: 75"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu chuẩn
                                </label>
                                <input
                                    type="text"
                                    value={formData.standard_type}
                                    onChange={(e) => setFormData({...formData, standard_type: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="VD: VietGAP, GlobalGAP"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Mô tả chi tiết quy trình..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Kích hoạt quy trình
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                                >
                                    {submitting ? 'Đang lưu...' : 'Tạo quy trình'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedProcess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Sửa quy trình kỹ thuật</h2>
                        </div>

                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên quy trình <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cây trồng <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.crop}
                                    onChange={(e) => setFormData({...formData, crop: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">-- Chọn cây trồng --</option>
                                    {crops.map(crop => (
                                        <option key={crop.id} value={crop.id}>{crop.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tổng số ngày <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.total_days}
                                    onChange={(e) => setFormData({...formData, total_days: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu chuẩn
                                </label>
                                <input
                                    type="text"
                                    value={formData.standard_type}
                                    onChange={(e) => setFormData({...formData, standard_type: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700">
                                    Kích hoạt quy trình
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedProcess(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    {submitting ? 'Đang lưu...' : 'Cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
