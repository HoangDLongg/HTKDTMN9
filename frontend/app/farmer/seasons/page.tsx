/**
 * Seasons List Page - Danh sách mùa vụ
 * Hiển thị tất cả mùa vụ của nông dân
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getFarmerByUserId } from '@/lib/farms-service';
import { getSeasonsByFarmerId, calculateSeasonStats } from '@/lib/seasons-service';
import type { Season, Farmer } from '@/types';
import Link from 'next/link';

export default function SeasonsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'planning' | 'in_progress' | 'completed' | 'failed'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');

      // Lấy farmer info
      const farmerData = await getFarmerByUserId(user.id);
      if (!farmerData) {
        setError('Không tìm thấy thông tin nông dân');
        setLoading(false);
        return;
      }
      
      setFarmer(farmerData);

      // Lấy tất cả seasons
      const seasonsData = await getSeasonsByFarmerId(farmerData.id);
      
      // Sắp xếp: active trước, sau đó theo ngày bắt đầu mới nhất
      seasonsData.sort((a, b) => {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
      
      setSeasons(seasonsData);
    } catch (err) {
      console.error('Error loading data:', err);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (expectedDate?: string) => {
    if (!expectedDate) return null;
    const now = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link href="/dashboard" className="text-green-600 hover:text-green-700">
              ← Về Dashboard
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">{error}</h2>
          </div>
        </main>
      </div>
    );
  }

  const stats = calculateSeasonStats(seasons);
  const filteredSeasons = filter === 'all' ? seasons : seasons.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌾 Mùa Vụ Của Tôi</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng mùa vụ</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Đang trồng</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            <div className="text-sm text-gray-600">Kế hoạch</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Thất bại</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                filter === 'in_progress'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Đang trồng ({stats.active})
            </button>
            <button
              onClick={() => setFilter('planning')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                filter === 'planning'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Kế hoạch ({stats.planned})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                filter === 'completed'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Hoàn thành ({stats.completed})
            </button>
          </div>
        </div>

        {/* Seasons List */}
        {filteredSeasons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có mùa vụ nào</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Liên hệ với hợp tác xã để đăng ký mùa vụ mới'
                : `Không có mùa vụ ${getStatusText(filter)}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSeasons.map((season) => {
              const daysRemaining = season.status === 'in_progress' 
                ? calculateDaysRemaining(season.expected_harvest_date)
                : null;
              
              return (
                <Link
                  key={season.id}
                  href={`/farmer/seasons/${season.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Crop & Farm Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">🌾</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {season.crop_details?.name || season.crop_name || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {season.farm_name || `Farm #${season.farm}`}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {season.season_code}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Dates */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Bắt đầu</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(season.start_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          {season.actual_harvest_date ? 'Đã thu hoạch' : 'Dự kiến thu hoạch'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(season.actual_harvest_date || season.expected_harvest_date)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Stats */}
                    <div className="flex items-center gap-4">
                      {/* Days Remaining */}
                      {daysRemaining !== null && daysRemaining >= 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {daysRemaining}
                          </div>
                          <div className="text-xs text-gray-600">ngày</div>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap ${getStatusColor(season.status)}`}>
                        {getStatusText(season.status)}
                      </span>
                    </div>
                  </div>

                  {/* Area & Yield */}
                  {(season.area_planted || season.expected_yield || season.actual_yield) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6 text-sm">
                      {season.area_planted && (
                        <div>
                          <span className="text-gray-600">Diện tích: </span>
                          <span className="font-medium text-gray-900">{season.area_planted} m²</span>
                        </div>
                      )}
                      {season.actual_yield && (
                        <div>
                          <span className="text-gray-600">Năng suất: </span>
                          <span className="font-medium text-green-600">{season.actual_yield} tấn</span>
                        </div>
                      )}
                      {!season.actual_yield && season.expected_yield && (
                        <div>
                          <span className="text-gray-600">Dự kiến: </span>
                          <span className="font-medium text-gray-900">{season.expected_yield} tấn</span>
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
