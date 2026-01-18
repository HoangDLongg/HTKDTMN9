/**
 * Admin Market Management Page - FIXED
 * Quản lý giá thị trường (match với backend model)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Plus, Search, TrendingUp, TrendingDown, X } from 'lucide-react';

interface MarketPrice {
    id: number;
    crop: {
        id: number;
        name: string;
    };
    price_date: string;
    price_min: number;
    price_max: number;
    price_avg: number;
    market_location: string;
    notes: string | null;
    created_at: string;
}

interface Crop {
    id: number;
    name: string;
}

export default function AdminMarketPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [prices, setPrices] = useState<MarketPrice[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        crop_id: '',
        price_date: new Date().toISOString().split('T')[0],
        price_min: '',
        price_max: '',
        price_avg: '',
        market_location: '',
        notes: ''
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

            const [pricesRes, cropsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/market-prices/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://127.0.0.1:8000/api/crops/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const pricesData = await pricesRes.json();
            const cropsData = await cropsRes.json();

            setPrices(Array.isArray(pricesData) ? pricesData : pricesData.results || []);
            setCrops(Array.isArray(cropsData) ? cropsData : cropsData.results || []);
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
                crop_id: parseInt(formData.crop_id),
                price_date: formData.price_date,
                price_min: parseFloat(formData.price_min),
                price_max: parseFloat(formData.price_max),
                price_avg: parseFloat(formData.price_avg),
                market_location: formData.market_location,
                notes: formData.notes || null
            };

            const response = await fetch('http://127.0.0.1:8000/api/market-prices/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create price');

            alert('✅ Thêm giá thành công!');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to create price:', error);
            alert('❌ Không thể thêm giá');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            crop_id: '',
            price_date: new Date().toISOString().split('T')[0],
            price_min: '',
            price_max: '',
            price_avg: '',
            market_location: '',
            notes: ''
        });
    };

    const filteredPrices = Array.isArray(prices) ? prices.filter(p =>
        !searchQuery ||
        p.crop?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.market_location?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    // Group by crop for stats
    const pricesByCrop = Array.isArray(prices) ? prices.reduce((acc, p) => {
        const cropName = p.crop?.name;
        if (cropName && p.price_avg != null) {
            if (!acc[cropName]) {
                acc[cropName] = [];
            }
            acc[cropName].push(p.price_avg);
        }
        return acc;
    }, {} as Record<string, number[]>) : {};

    const getAveragePrice = (cropName: string) => {
        const cropPrices = pricesByCrop[cropName] || [];
        return cropPrices.length > 0
            ? (cropPrices.reduce((sum, p) => sum + p, 0) / cropPrices.length).toFixed(0)
            : '0';
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
                title="📊 Quản lý giá thị trường"
                subtitle="Cập nhật và theo dõi giá cả nông sản"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{prices.length}</div>
                        <div className="text-gray-600">Tổng bản ghi giá</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {Object.keys(pricesByCrop).length}
                        </div>
                        <div className="text-gray-600">Cây trồng có giá</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {new Set(prices.map(p => p.market_location)).size}
                        </div>
                        <div className="text-gray-600">Chợ/Thị trường</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {prices.filter(p => p.price_date === new Date().toISOString().split('T')[0]).length}
                        </div>
                        <div className="text-gray-600">Giá hôm nay</div>
                    </div>
                </div>

                {/* Search & Add */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm cây trồng, chợ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm giá mới
                        </button>
                    </div>
                </div>

                {/* Prices Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cây trồng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá TB (VNĐ/kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoảng giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chợ/Thị trường</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">So sánh TB</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPrices.map((price) => {
                                    const avgPrice = parseFloat(getAveragePrice(price.crop?.name || ''));
                                    const isHigher = (price.price_avg || 0) > avgPrice;

                                    return (
                                        <tr key={price.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(price.price_date).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{price.crop?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-green-600">
                                                        {(price.price_avg || 0).toLocaleString()}
                                                    </span>
                                                    {isHigher ? (
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {(price.price_min || 0).toLocaleString()} - {(price.price_max || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{price.market_location || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    TB: {avgPrice.toLocaleString()} VNĐ
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredPrices.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">📊</div>
                            <p className="text-gray-500">Chưa có dữ liệu giá</p>
                            <p className="text-sm text-gray-400 mt-2">Chạy: python backend/seed_market_prices.py</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Thêm giá mới</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cây trồng *</label>
                                    <select
                                        required
                                        value={formData.crop_id}
                                        onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">-- Chọn cây trồng --</option>
                                        {crops.map(crop => (
                                            <option key={crop.id} value={crop.id}>{crop.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.price_date}
                                        onChange={(e) => setFormData({ ...formData, price_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá thấp *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="1000"
                                            value={formData.price_min}
                                            onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="20000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá TB *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="1000"
                                            value={formData.price_avg}
                                            onChange={(e) => setFormData({ ...formData, price_avg: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="25000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá cao *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="1000"
                                            value={formData.price_max}
                                            onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="30000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chợ/Thị trường *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.market_location}
                                        onChange={(e) => setFormData({ ...formData, market_location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="VD: Chợ đầu mối Bình Điền"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ghi chú thêm..."
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
                                        {submitting ? 'Đang thêm...' : 'Thêm giá'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
