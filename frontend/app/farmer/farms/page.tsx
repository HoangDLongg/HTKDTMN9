/**
 * My Farms Page - Vườn Của Tôi
 * Hiển thị danh sách vườn của nông dân đang đăng nhập
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getFarmerByUserId, getFarmsByFarmerId, getSeasonsByFarmId, calculateFarmStats } from '@/lib/farms-service';
import type { Farm, Farmer, Season } from '@/types';
import Link from 'next/link';

export default function MyFarmsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [seasonsMap, setSeasonsMap] = useState<Record<number, Season[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadFarmerData();
    }
  }, [user, authLoading]);

  const loadFarmerData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');

      // 1. Lấy thông tin farmer từ user id
      const farmerData = await getFarmerByUserId(user.id);
      
      if (!farmerData) {
        setError('Không tìm thấy thông tin nông dân. Vui lòng liên hệ hợp tác xã.');
        setLoading(false);
        return;
      }
      
      setFarmer(farmerData);

      // 2. Lấy danh sách vườn của farmer
      const farmsData = await getFarmsByFarmerId(farmerData.id);
      setFarms(farmsData);

      // 3. Lấy seasons cho mỗi vườn
      const seasonsData: Record<number, Season[]> = {};
      for (const farm of farmsData) {
        const seasons = await getSeasonsByFarmId(farm.id);
        seasonsData[farm.id] = seasons;
      }
      setSeasonsMap(seasonsData);

    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={loadFarmerData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const allSeasons = Object.values(seasonsMap).flat();
  const stats = calculateFarmStats(farms, allSeasons);

  // Get current season for each farm
  const getCurrentSeason = (farmId: number): Season | null => {
    const seasons = seasonsMap[farmId] || [];
    return seasons.find(s => s.status === 'in_progress') || seasons[0] || null;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planning: '📋 Lên kế hoạch',
      in_progress: '🌱 Đang trồng',
      completed: '✅ Hoàn thành',
      failed: '❌ Thất bại',
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏡 Vườn Của Tôi</h1>
              <p className="text-sm text-gray-600">Mã nông dân: {farmer?.farmer_code}</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Về Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalFarms}</div>
            <div className="text-gray-600">Tổng số vườn</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalArea} ha</div>
            <div className="text-gray-600">Tổng diện tích</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.activeFarms}</div>
            <div className="text-gray-600">Đang canh tác</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-600 mb-2">{stats.idleFarms}</div>
            <div className="text-gray-600">Nghỉ đất</div>
          </div>
        </div>

        {/* Farms List */}
        {farms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có vườn nào</h2>
            <p className="text-gray-600 mb-6">
              Liên hệ với hợp tác xã để đăng ký vườn của bạn
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => {
              const currentSeason = getCurrentSeason(farm.id);
              const farmSeasons = seasonsMap[farm.id] || [];
              
              return (
                <Link
                  key={farm.id}
                  href={`/farmer/farms/${farm.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Farm Header */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{farm.name}</h3>
                    <p className="text-sm opacity-90">
                      📏 {farm.area_hectare} ha
                    </p>
                  </div>

                  {/* Farm Body */}
                  <div className="p-4">
                    {/* Location */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">📍 Vị trí</div>
                      <div className="text-gray-900">
                        {farm.ward_details?.name || 'Chưa cập nhật'}
                      </div>
                    </div>

                    {/* Soil Type */}
                    {farm.soil_type && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">🌾 Loại đất</div>
                        <div className="text-gray-900">{farm.soil_type}</div>
                      </div>
                    )}

                    {/* Current Season */}
                    {currentSeason ? (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Vụ mùa hiện tại</div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="font-semibold text-gray-900 mb-1">
                            {currentSeason.crop_details?.name || 'N/A'}
                          </div>
                          <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(currentSeason.status)}`}>
                            {getStatusText(currentSeason.status)}
                          </div>
                          {currentSeason.start_date && (
                            <div className="text-xs text-gray-600 mt-2">
                              Bắt đầu: {new Date(currentSeason.start_date).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 text-center py-4 bg-gray-50 rounded-lg">
                        <div className="text-gray-500">💤 Chưa có vụ mùa</div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                      <span>📅 {farmSeasons.length} vụ mùa</span>
                      <span className="text-blue-600 font-medium">Xem chi tiết →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
