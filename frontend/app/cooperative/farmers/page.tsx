/**
 * HTX Farmers Management Page - FULL VERSION
 * Quản lý nông dân trong HTX với đầy đủ thông tin chi tiết
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { 
    Search, Users, Phone, Mail, MapPin, Calendar, Home, 
    CreditCard, Building, IdCard, Tractor, Leaf, BarChart3,
    ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';

interface Farmer {
    id: number;
    user_details?: {
        id: number;
        username: string;
        email: string;
        full_name: string;
        phone?: string;
    };
    farmer_code: string;
    cooperative?: number;
    cooperative_details?: {
        id: number;
        name: string;
        code: string;
    };
    address?: string;
    ward_details?: {
        id: number;
        name: string;
        district?: {
            name: string;
            province?: {
                name: string;
            };
        };
    };
    id_card?: string;
    bank_account?: string;
    bank_name?: string;
    created_at: string;
}

interface Farm {
    id: number;
    name: string;
    area_hectare: number;
    soil_type?: string;
    water_source?: string;
}

interface Season {
    id: number;
    season_code: string;
    status: string;
    crop_details?: {
        name: string;
    };
    area_planted?: number;
    start_date: string;
}

export default function HTXFarmersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [farmsData, setFarmsData] = useState<{ [key: number]: Farm[] }>({});
    const [seasonsData, setSeasonsData] = useState<{ [key: number]: Season[] }>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFarmers, setExpandedFarmers] = useState<Set<number>>(new Set());

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

            // Load farmers
            const farmersRes = await fetch('http://127.0.0.1:8000/api/farmers/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const farmersData = await farmersRes.json();
            const farmersList = Array.isArray(farmersData) ? farmersData : farmersData.results || [];
            setFarmers(farmersList);

            // Load all farms
            const farmsRes = await fetch('http://127.0.0.1:8000/api/farms/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const farmsResult = await farmsRes.json();
            const farmsList = Array.isArray(farmsResult) ? farmsResult : farmsResult.results || [];
            
            // Group farms by farmer_id
            const farmsMap: { [key: number]: Farm[] } = {};
            farmsList.forEach((farm: any) => {
                const farmerId = farm.farmer;
                if (farmerId) {
                    if (!farmsMap[farmerId]) farmsMap[farmerId] = [];
                    farmsMap[farmerId].push(farm);
                }
            });
            setFarmsData(farmsMap);

            // Load all seasons
            const seasonsRes = await fetch('http://127.0.0.1:8000/api/seasons/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const seasonsResult = await seasonsRes.json();
            const seasonsList = Array.isArray(seasonsResult) ? seasonsResult : seasonsResult.results || [];
            
            // Group seasons by farmer (via farm)
            const seasonsMap: { [key: number]: Season[] } = {};
            seasonsList.forEach((season: any) => {
                if (season.farm_details?.farmer) {
                    const farmerId = season.farm_details.farmer;
                    if (!seasonsMap[farmerId]) seasonsMap[farmerId] = [];
                    seasonsMap[farmerId].push(season);
                }
            });
            setSeasonsData(seasonsMap);

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (farmerId: number) => {
        const newExpanded = new Set(expandedFarmers);
        if (newExpanded.has(farmerId)) {
            newExpanded.delete(farmerId);
        } else {
            newExpanded.add(farmerId);
        }
        setExpandedFarmers(newExpanded);
    };

    const filteredFarmers = Array.isArray(farmers) ? farmers.filter(f =>
        !searchQuery ||
        f.user_details?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.user_details?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.user_details?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.farmer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.bank_account?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    // Calculate statistics
    const totalFarms = Object.values(farmsData).reduce((acc, farms) => acc + farms.length, 0);
    const totalArea = Object.values(farmsData).reduce((acc, farms) => 
        acc + farms.reduce((sum, f) => sum + (Number(f.area_hectare) || 0), 0), 0
    );
    const totalSeasons = Object.values(seasonsData).reduce((acc, seasons) => acc + seasons.length, 0);
    const activeSeasons = Object.values(seasonsData).reduce((acc, seasons) => 
        acc + seasons.filter(s => s.status === 'in_progress').length, 0
    );

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
                title="👨‍🌾 Quản lý nông dân"
                subtitle="Danh sách nông dân trong hợp tác xã"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div className="text-xs text-gray-500">Nông dân</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{farmers.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tractor className="w-5 h-5 text-green-600" />
                            <div className="text-xs text-gray-500">Trang trại</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{totalFarms}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-purple-600" />
                            <div className="text-xs text-gray-500">Tổng diện tích</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{Number(totalArea || 0).toFixed(1)}</div>
                        <div className="text-xs text-gray-500">ha</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-5 h-5 text-orange-600" />
                            <div className="text-xs text-gray-500">Vụ mùa</div>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">{totalSeasons}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-teal-600" />
                            <div className="text-xs text-gray-500">Đang hoạt động</div>
                        </div>
                        <div className="text-2xl font-bold text-teal-600">{activeSeasons}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Home className="w-5 h-5 text-indigo-600" />
                            <div className="text-xs text-gray-500">Trong HTX</div>
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {farmers.filter(f => f.cooperative).length}
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nông dân..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Farmers List */}
                <div className="space-y-6">
                    {filteredFarmers.map((farmer) => {
                        const isExpanded = expandedFarmers.has(farmer.id);
                        const farms = farmsData[farmer.id] || [];
                        const seasons = seasonsData[farmer.id] || [];
                        const totalFarmArea = farms.reduce((sum, f) => sum + (Number(f.area_hectare) || 0), 0);
                        
                        return (
                            <div key={farmer.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden border border-gray-200">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold">
                                                    {farmer.user_details?.full_name || farmer.user_details?.username}
                                                </h3>
                                                <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-sm">
                                                    {farmer.farmer_code}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-50">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">@{farmer.user_details?.username}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-medium">
                                                #{farmer.id}
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-1 bg-green-500 bg-opacity-80 rounded">
                                                    {farms.length} farm
                                                </span>
                                                <span className="px-2 py-1 bg-orange-500 bg-opacity-80 rounded">
                                                    {seasons.length} vụ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column - Thông tin cá nhân */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 border-b pb-2">Thông tin cá nhân</h4>
                                            
                                            {/* Liên hệ */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-500">SĐT:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {farmer.user_details?.phone || 'Chưa có'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-500">Email:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {farmer.user_details?.email || 'Chưa có'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CMND/CCCD */}
                                            {farmer.id_card && (
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <IdCard className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-500">CMND/CCCD:</span>
                                                    <span className="font-medium text-gray-900">{farmer.id_card}</span>
                                                </div>
                                            )}

                                            {/* Địa chỉ */}
                                            {farmer.address && (
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Địa chỉ</span>
                                                    </div>
                                                    <p className="text-gray-900 text-sm ml-6">{farmer.address}</p>
                                                    {farmer.ward_details && (
                                                        <p className="text-gray-500 text-xs ml-6 mt-1">
                                                            {farmer.ward_details.name}, {farmer.ward_details.district?.name}, {farmer.ward_details.district?.province?.name}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tài khoản ngân hàng */}
                                            {farmer.bank_account && (
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                                        <CreditCard className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Tài khoản ngân hàng</span>
                                                    </div>
                                                    <div className="ml-6 space-y-1">
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">STK: </span>
                                                            <span className="font-mono font-medium text-gray-900">{farmer.bank_account}</span>
                                                        </div>
                                                        {farmer.bank_name && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Building className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-900">{farmer.bank_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* HTX */}
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-500 mb-2">
                                                    <Home className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Hợp tác xã</span>
                                                </div>
                                                {farmer.cooperative_details ? (
                                                    <div className="ml-6">
                                                        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-lg bg-green-100 text-green-800">
                                                            {farmer.cooperative_details.name}
                                                        </span>
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            ({farmer.cooperative_details.code})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="ml-6 text-gray-400 text-sm">
                                                        Chưa tham gia HTX
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column - Thống kê */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 border-b pb-2">Thống kê canh tác</h4>
                                            
                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                    <div className="text-2xl font-bold text-blue-600">{farms.length}</div>
                                                    <div className="text-xs text-blue-800">Trang trại</div>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                                    <div className="text-2xl font-bold text-green-600">{Number(totalFarmArea || 0).toFixed(1)}</div>
                                                    <div className="text-xs text-green-800">ha</div>
                                                </div>
                                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                                    <div className="text-2xl font-bold text-orange-600">{seasons.length}</div>
                                                    <div className="text-xs text-orange-800">Vụ mùa</div>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {seasons.filter(s => s.status === 'in_progress').length}
                                                    </div>
                                                    <div className="text-xs text-purple-800">Đang trồng</div>
                                                </div>
                                            </div>

                                            {/* Farms Summary */}
                                            {farms.length > 0 && (
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                                            <Tractor className="w-4 h-4" />
                                                            Danh sách trang trại
                                                        </div>
                                                        <span className="text-xs text-gray-500">{farms.length} farm</span>
                                                    </div>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {farms.map((farm, idx) => (
                                                            <div key={farm.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-200 last:border-0">
                                                                <span className="text-gray-700">{idx + 1}. {farm.name}</span>
                                                                <span className="font-medium text-gray-900">{farm.area_hectare} ha</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recent Seasons */}
                                            {seasons.length > 0 && (
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                                            <Leaf className="w-4 h-4" />
                                                            Vụ mùa gần đây
                                                        </div>
                                                        <span className="text-xs text-gray-500">{seasons.length} vụ</span>
                                                    </div>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {seasons.slice(0, 5).map((season) => (
                                                            <div key={season.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-200 last:border-0">
                                                                <div>
                                                                    <span className="text-gray-700">{season.crop_details?.name}</span>
                                                                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                                                                        season.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                                                        season.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {season.status}
                                                                    </span>
                                                                </div>
                                                                <span className="text-gray-500">{season.area_planted || 0} ha</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand/Collapse Button */}
                                    {(farms.length > 0 || seasons.length > 0) && (
                                        <div className="mt-4 pt-4 border-t">
                                            <button
                                                onClick={() => toggleExpand(farmer.id)}
                                                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4" />
                                                        Thu gọn chi tiết
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4" />
                                                        Xem chi tiết đầy đủ
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t space-y-4">
                                            {/* Detailed Farms */}
                                            {farms.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-gray-900 mb-3">Chi tiết trang trại</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {farms.map((farm) => (
                                                            <div key={farm.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h6 className="font-medium text-green-900">{farm.name}</h6>
                                                                    <span className="text-sm font-bold text-green-600">{farm.area_hectare} ha</span>
                                                                </div>
                                                                {farm.soil_type && (
                                                                    <div className="text-xs text-gray-600">
                                                                        <span className="text-gray-500">Đất:</span> {farm.soil_type}
                                                                    </div>
                                                                )}
                                                                {farm.water_source && (
                                                                    <div className="text-xs text-gray-600">
                                                                        <span className="text-gray-500">Nguồn nước:</span> {farm.water_source}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Detailed Seasons */}
                                            {seasons.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-gray-900 mb-3">Chi tiết vụ mùa</h5>
                                                    <div className="space-y-2">
                                                        {seasons.map((season) => (
                                                            <div key={season.id} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="font-medium text-orange-900">{season.season_code}</div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {season.crop_details?.name} - {season.area_planted || 0} ha
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            Bắt đầu: {new Date(season.start_date).toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                    </div>
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                        season.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                                                        season.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                        season.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {season.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer - Ngày tạo */}
                                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Tạo ngày: {new Date(farmer.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-gray-100 rounded">ID: {farmer.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredFarmers.length === 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">👨‍🌾</div>
                        <p className="text-gray-500">Không tìm thấy nông dân nào</p>
                    </div>
                )}
            </main>
        </div>
    );
}
