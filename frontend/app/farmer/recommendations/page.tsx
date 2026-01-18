/**
 * Recommendations Page - Đề Xuất Cây Trồng
 * Hiển thị các đề xuất từ HTX và cho phép đăng ký
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getFarmerByUserId, getFarmsByFarmerId } from '@/lib/farms-service';
import { getActiveRecommendations, registerForRecommendation, getFarmerRegistrations } from '@/lib/market-service';
import type { PlantingRecommendation, Farmer, Farm, SeasonRegistration } from '@/types';
import Link from 'next/link';

export default function RecommendationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [recommendations, setRecommendations] = useState<PlantingRecommendation[]>([]);
  const [registrations, setRegistrations] = useState<SeasonRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRec, setSelectedRec] = useState<PlantingRecommendation | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({
    farm_id: 0,
    area_registered: 0,
  });

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

      const farmerData = await getFarmerByUserId(user.id);
      if (!farmerData) {
        setError('Không tìm thấy thông tin nông dân');
        setLoading(false);
        return;
      }
      
      setFarmer(farmerData);

      const [farmsData, recsData, regsData] = await Promise.all([
        getFarmsByFarmerId(farmerData.id),
        getActiveRecommendations(),
        getFarmerRegistrations(farmerData.id),
      ]);

      setFarms(farmsData);
      setRecommendations(recsData);
      setRegistrations(regsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (rec: PlantingRecommendation) => {
    setSelectedRec(rec);
    setShowRegisterForm(true);
    setRegisterData({
      farm_id: farms[0]?.id || 0,
      area_registered: parseFloat(rec.recommended_area || '0'),
    });
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRec || !farmer) return;

    const result = await registerForRecommendation({
      recommendation_id: selectedRec.id,
      farm_id: registerData.farm_id,
      area_registered: registerData.area_registered,
    });

    if (result) {
      alert('Đăng ký thành công! Chờ HTX phê duyệt.');
      setShowRegisterForm(false);
      setSelectedRec(null);
      // Reload registrations
      const regsData = await getFarmerRegistrations(farmer.id);
      setRegistrations(regsData);
    } else {
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const isRegistered = (recId: number) => {
    return registrations.some(r => r.recommendation === recId);
  };

  const getRegistrationStatus = (recId: number) => {
    const reg = registrations.find(r => r.recommendation === recId);
    return reg?.status;
  };

  const formatPrice = (price?: string) => {
    if (!price) return 'N/A';
    return parseFloat(price).toLocaleString('vi-VN') + ' đ/kg';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPriorityBadge = (level?: number) => {
    if (!level) return null;
    if (level >= 8) return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">🔥 Ưu tiên cao</span>;
    if (level >= 5) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">⚡ Ưu tiên</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">Thông thường</span>;
  };

  const getStatusBadge = (status?: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded">⏳ Chờ duyệt</span>,
      approved: <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">✅ Đã duyệt</span>,
      rejected: <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">❌ Từ chối</span>,
    };
    return status ? badges[status] : null;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💡 Đề Xuất Cây Trồng</h1>
              <p className="text-sm text-gray-600">Từ hợp tác xã</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
            <div className="text-sm text-gray-600">Đề xuất mới</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {registrations.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Chờ duyệt</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {registrations.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{farms.length}</div>
            <div className="text-sm text-gray-600">Vườn của bạn</div>
          </div>
        </div>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đề xuất mới</h2>
            <p className="text-gray-600">
              Hợp tác xã sẽ gửi đề xuất cây trồng phù hợp cho bạn
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => {
              const registered = isRegistered(rec.id);
              const regStatus = getRegistrationStatus(rec.id);
              
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-4xl">🌾</div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              {rec.crop_details?.name || rec.crop_name || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {rec.cooperative_details?.name || 'Hợp tác xã'}
                            </p>
                          </div>
                        </div>
                        {getPriorityBadge(rec.priority_level)}
                      </div>
                      
                      {registered && getStatusBadge(regStatus)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Diện tích đề xuất</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {rec.recommended_area} ha
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Giá thu mua dự kiến</div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatPrice(rec.expected_price)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Ngày bắt đầu</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatDate(rec.recommended_start_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Mã đề xuất</div>
                        <div className="text-sm font-mono text-gray-700">
                          #{rec.id}
                        </div>
                      </div>
                    </div>

                    {rec.reason && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <div className="text-xl">💡</div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-blue-900 mb-1">Lý do đề xuất</div>
                            <p className="text-sm text-blue-800">{rec.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!registered ? (
                      <button
                        onClick={() => handleRegisterClick(rec)}
                        className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        📝 Đăng ký tham gia
                      </button>
                    ) : regStatus === 'approved' ? (
                      <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        ✅ Đã được duyệt - Vụ mùa sẽ được tạo tự động
                      </div>
                    ) : regStatus === 'pending' ? (
                      <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                        ⏳ Đang chờ HTX phê duyệt
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        ❌ Đã bị từ chối
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegisterForm && selectedRec && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Đăng ký tham gia
              </h2>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900">
                  {selectedRec.crop_details?.name || selectedRec.crop_name}
                </div>
                <div className="text-sm text-gray-600">
                  Diện tích đề xuất: {selectedRec.recommended_area} ha
                </div>
              </div>

              <form onSubmit={handleSubmitRegistration}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn vườn
                  </label>
                  <select
                    value={registerData.farm_id}
                    onChange={(e) => setRegisterData({...registerData, farm_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                  >
                    <option value={0}>-- Chọn vườn --</option>
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name} ({farm.area_hectare} ha)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích đăng ký (ha)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={registerData.area_registered}
                    onChange={(e) => setRegisterData({...registerData, area_registered: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterForm(false);
                      setSelectedRec(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
