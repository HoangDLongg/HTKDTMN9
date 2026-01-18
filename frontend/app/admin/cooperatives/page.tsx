/**
 * Admin Cooperatives Management Page
 * Quản lý hợp tác xã
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Pencil, Trash2, Plus, Search, Eye, Building2, X } from 'lucide-react';

interface Cooperative {
    id: number;
    name: string;
    code: string;
    address: string;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
    created_at: string;
}

export default function AdminCooperativesPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCoop, setSelectedCoop] = useState<Cooperative | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        manager_name: ''
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

            const response = await fetch('http://127.0.0.1:8000/api/cooperatives/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setCooperatives(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load cooperatives:', error);
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

            const response = await fetch('http://127.0.0.1:8000/api/cooperatives/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create cooperative');

            alert('✅ Tạo hợp tác xã thành công!');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to create cooperative:', error);
            alert('❌ Không thể tạo hợp tác xã');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCoop) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/cooperatives/${selectedCoop.id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update cooperative');

            alert('✅ Cập nhật thành công!');
            setShowEditModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to update cooperative:', error);
            alert('❌ Không thể cập nhật');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCoop) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/cooperatives/${selectedCoop.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete cooperative');

            alert('✅ Xóa hợp tác xã thành công!');
            setShowDeleteModal(false);
            setSelectedCoop(null);
            loadData();
        } catch (error) {
            console.error('Failed to delete cooperative:', error);
            alert('❌ Không thể xóa hợp tác xã');
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (coop: Cooperative) => {
        setSelectedCoop(coop);
        setFormData({
            name: coop.name,
            code: coop.code,
            address: coop.address,
            phone: coop.phone || '',
            email: coop.email || '',
            manager_name: coop.manager_name || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (coop: Cooperative) => {
        setSelectedCoop(coop);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            address: '',
            phone: '',
            email: '',
            manager_name: ''
        });
        setSelectedCoop(null);
    };

    const filteredCooperatives = Array.isArray(cooperatives) ? cooperatives.filter(c =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

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
                title="🏢 Quản lý hợp tác xã"
                subtitle="Quản lý các hợp tác xã trong hệ thống"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{cooperatives.length}</div>
                        <div className="text-gray-600">Tổng hợp tác xã</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {cooperatives.filter(c => c.manager_name).length}
                        </div>
                        <div className="text-gray-600">Có người quản lý</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {cooperatives.filter(c => c.email).length}
                        </div>
                        <div className="text-gray-600">Có email liên hệ</div>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên, mã, địa chỉ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm hợp tác xã
                        </button>
                    </div>
                </div>

                {/* Cooperatives Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCooperatives.map((coop) => (
                        <div key={coop.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-6 h-6" />
                                            <span className="text-sm font-medium opacity-90">HTX</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">{coop.name}</h3>
                                        <p className="text-sm opacity-90">Mã: {coop.code}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Địa chỉ</div>
                                        <div className="text-sm text-gray-900">{coop.address || 'Chưa cập nhật'}</div>
                                    </div>

                                    {coop.manager_name && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Người quản lý</div>
                                            <div className="text-sm text-gray-900">{coop.manager_name}</div>
                                        </div>
                                    )}

                                    {coop.phone && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Điện thoại</div>
                                            <div className="text-sm text-gray-900">{coop.phone}</div>
                                        </div>
                                    )}

                                    {coop.email && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Email</div>
                                            <div className="text-sm text-gray-900">{coop.email}</div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Ngày tạo</div>
                                        <div className="text-sm text-gray-900">
                                            {new Date(coop.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => openEditModal(coop)}
                                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(coop)}
                                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCooperatives.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <div className="text-gray-400 text-5xl mb-4">🏢</div>
                        <p className="text-gray-500">Không tìm thấy hợp tác xã nào</p>
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Thêm hợp tác xã mới</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên HTX *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="VD: HTX Nông nghiệp Bình Tân"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã HTX *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="VD: HTX001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                                    <textarea
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Địa chỉ đầy đủ"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Người quản lý</label>
                                    <input
                                        type="text"
                                        value={formData.manager_name}
                                        onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Họ tên người quản lý"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0123456789"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="email@example.com"
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
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo HTX'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCoop && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Sửa hợp tác xã</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên HTX *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã HTX *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                                    <textarea
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Người quản lý</label>
                                    <input
                                        type="text"
                                        value={formData.manager_name}
                                        onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
            {showDeleteModal && selectedCoop && (
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
                                    Bạn có chắc chắn muốn xóa hợp tác xã này?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-medium text-gray-900">{selectedCoop.name}</div>
                                    <div className="text-sm text-gray-500">Mã: {selectedCoop.code}</div>
                                    <div className="text-sm text-gray-500">{selectedCoop.address}</div>
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
                                    {submitting ? 'Đang xóa...' : 'Xóa HTX'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
