/**
 * Farm Detail Page - Chi tiết vườn
 * Hiển thị thông tin chi tiết và các vụ mùa của một vườn
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getFarmById, getSeasonsByFarmId } from '@/lib/farms-service';
import type { Farm, Season } from '@/types';
import Link from 'next/link';

export default function FarmDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const farmId = parseInt(params.id as string);
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && farmId) {
      loadFarmData();
    }
  }, [user, authLoading, farmId]);

  const loadFarmData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load farm details và seasons song song
      const [farmData, seasonsData] = await Promise.all([
        getFarmById(farmId),
        getSeasonsByFarmId(farmId)
      ]);

      if (!farmData) {
        setError('Không tìm thấy thông tin vườn');
        setLoading(false);
        return;
      }

      setFarm(farmData);
      setSeasons(seasonsData);
    } catch (err) {
      console.error('Error loading farm:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-800 border-gray-300',
      in_progress: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/farmer/farms"
              className="inline-flex items-center text-green-600 hover:text-green-700"
            >
              ← Quay lại danh sách vườn
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">{error || 'Không tìm thấy vườn'}</h2>
          </div>
        </main>
      </div>
    );
  }

  // Phân loại seasons
  const activeSeasons = seasons.filter(s => s.status === 'in_progress');
  const plannedSeasons = seasons.filter(s => s.status === 'planning');
  const completedSeasons = seasons.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/farmer/farms"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            ← Quay lại danh sách vườn
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
          <p className="text-sm text-gray-600">Mã vườn: #{farm.id}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Farm Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏡</span>
                Thông tin vườn
              </h2>
              
              <div className="space-y-4">
                {/* Diện tích */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">📏 Diện tích</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {farm.area_hectare} ha
                  </div>
                </div>

                {/* Vị trí */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">📍 Vị trí</div>
                  <div className="text-gray-900">
                    {farm.ward_details?.name || 'Chưa cập nhật'}
                  </div>
                </div>

                {/* Loại đất */}
                {farm.soil_type && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">🌾 Loại đất</div>
                    <div className="text-gray-900">{farm.soil_type}</div>
                  </div>
                )}

                {/* Nguồn nước */}
                {farm.water_source && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">💧 Nguồn nước</div>
                    <div className="text-gray-900">{farm.water_source}</div>
                  </div>
                )}

                {/* Tọa độ */}
                {farm.location_lat && farm.location_lng && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">🗺️ Tọa độ</div>
                    <div className="text-xs text-gray-700 font-mono">
                      {farm.location_lat}, {farm.location_lng}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Thống kê
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng vụ mùa</span>
                  <span className="font-bold text-gray-900">{seasons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đang trồng</span>
                  <span className="font-bold text-green-600">{activeSeasons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kế hoạch</span>
                  <span className="font-bold text-blue-600">{plannedSeasons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hoàn thành</span>
                  <span className="font-bold text-gray-600">{completedSeasons.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Seasons */}
          <div className="lg:col-span-2">
            {/* Vụ mùa đang trồng */}
            {activeSeasons.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🌱</span>
                  Vụ mùa đang trồng
                </h2>
                <div className="space-y-4">
                  {activeSeasons.map(season => (
                    <div key={season.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {season.crop_details?.name || season.crop_name || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600">{season.season_code}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(season.status)}`}>
                          {getStatusText(season.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Ngày bắt đầu</div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(season.start_date)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Dự kiến thu hoạch</div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(season.expected_harvest_date)}</div>
                        </div>
                        {season.area_planted && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Diện tích trồng</div>
                            <div className="text-sm font-medium text-gray-900">{season.area_planted} m²</div>
                          </div>
                        )}
                        {season.expected_yield && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Năng suất dự kiến</div>
                            <div className="text-sm font-medium text-gray-900">{season.expected_yield} tấn</div>
                          </div>
                        )}
                      </div>

                      {season.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">Ghi chú</div>
                          <p className="text-sm text-gray-700">{season.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vụ mùa kế hoạch */}
            {plannedSeasons.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Vụ mùa kế hoạch
                </h2>
                <div className="space-y-4">
                  {plannedSeasons.map(season => (
                    <div key={season.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {season.crop_details?.name || season.crop_name || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600">{season.season_code}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(season.status)}`}>
                          {getStatusText(season.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Dự kiến bắt đầu</div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(season.start_date)}</div>
                        </div>
                        {season.expected_harvest_date && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Dự kiến thu hoạch</div>
                            <div className="text-sm font-medium text-gray-900">{formatDate(season.expected_harvest_date)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lịch sử vụ mùa */}
            {completedSeasons.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📚</span>
                  Lịch sử vụ mùa
                </h2>
                <div className="space-y-4">
                  {completedSeasons.map(season => (
                    <div key={season.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {season.crop_details?.name || season.crop_name || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600">{season.season_code}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(season.status)}`}>
                          {getStatusText(season.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Ngày bắt đầu</div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(season.start_date)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Ngày thu hoạch</div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(season.actual_harvest_date || season.expected_harvest_date)}</div>
                        </div>
                        {season.actual_yield && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Năng suất thực tế</div>
                            <div className="text-sm font-medium text-green-600">{season.actual_yield} tấn</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No seasons */}
            {seasons.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có vụ mùa nào</h2>
                <p className="text-gray-600">
                  Liên hệ với hợp tác xã để đăng ký vụ mùa mới cho vườn này
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
