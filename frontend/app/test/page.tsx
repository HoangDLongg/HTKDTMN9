/**
 * API Test Page
 * Test connection to Django backend and display data from database
 */

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { 
  User, 
  Role, 
  Province, 
  Crop, 
  Cooperative,
  Season,
  MarketPrice,
  PaginatedResponse 
} from '@/types';

export default function TestPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for different data types
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        rolesRes,
        usersRes,
        provincesRes,
        cropsRes,
        cooperativesRes,
        seasonsRes,
        marketPricesRes,
      ] = await Promise.all([
        apiClient.get<PaginatedResponse<Role>>('/roles/'),
        apiClient.get<PaginatedResponse<User>>('/users/'),
        apiClient.get<PaginatedResponse<Province>>('/provinces/'),
        apiClient.get<PaginatedResponse<Crop>>('/crops/'),
        apiClient.get<PaginatedResponse<Cooperative>>('/cooperatives/'),
        apiClient.get<PaginatedResponse<Season>>('/seasons/'),
        apiClient.get<PaginatedResponse<MarketPrice>>('/market-prices/'),
      ]);

      setRoles(rolesRes.results);
      setUsers(usersRes.results);
      setProvinces(provincesRes.results);
      setCrops(cropsRes.results);
      setCooperatives(cooperativesRes.results);
      setSeasons(seasonsRes.results);
      setMarketPrices(marketPricesRes.results);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải dữ liệu từ database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h2 className="text-xl font-bold text-red-900 mb-2">❌ Lỗi Kết Nối</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Thử Lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ✅ Kết Nối Backend Thành Công!
          </h1>
          <p className="text-lg">
            Dữ liệu từ PostgreSQL Database qua Django REST API
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="/"
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 font-medium"
            >
              ← Về Trang Chủ
            </a>
            <button
              onClick={fetchAllData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
            >
              🔄 Tải Lại Dữ Liệu
            </button>
          </div>
        </div>

        {/* Data Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{roles.length}</div>
            <div className="text-gray-600">Roles</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{users.length}</div>
            <div className="text-gray-600">Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{provinces.length}</div>
            <div className="text-gray-600">Provinces</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">{crops.length}</div>
            <div className="text-gray-600">Crops</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">{cooperatives.length}</div>
            <div className="text-gray-600">Cooperatives</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{seasons.length}</div>
            <div className="text-gray-600">Seasons</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-pink-600 mb-2">{marketPrices.length}</div>
            <div className="text-gray-600">Market Prices</div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="space-y-8">
          {/* Roles */}
          {roles.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">👥 Roles ({roles.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {roles.map(role => (
                      <tr key={role.role_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{role.role_id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{role.role_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{role.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {users.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-green-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">👤 Users ({users.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.slice(0, 10).map(user => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.user_id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.phone_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 10 && (
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                    Hiển thị 10/{users.length} users
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Provinces */}
          {provinces.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-purple-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">📍 Provinces ({provinces.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {provinces.slice(0, 10).map(province => (
                      <tr key={province.province_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{province.province_id}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{province.province_code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{province.province_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {provinces.length > 10 && (
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                    Hiển thị 10/{provinces.length} provinces
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crops */}
          {crops.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-orange-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">🌱 Crops ({crops.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scientific Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (days)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {crops.slice(0, 10).map(crop => (
                      <tr key={crop.crop_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{crop.crop_id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{crop.crop_name}</td>
                        <td className="px-6 py-4 text-sm italic text-gray-600">{crop.scientific_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{crop.category || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{crop.growth_duration_days || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {crops.length > 10 && (
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                    Hiển thị 10/{crops.length} crops
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seasons */}
          {seasons.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-indigo-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">🗓️ Seasons ({seasons.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area (ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {seasons.slice(0, 10).map(season => (
                      <tr key={season.season_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{season.season_id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{season.season_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{season.start_date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            season.status === 'completed' ? 'bg-green-100 text-green-800' :
                            season.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            season.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {season.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{season.area_planted || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {seasons.length > 10 && (
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                    Hiển thị 10/{seasons.length} seasons
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Market Prices */}
          {marketPrices.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-pink-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">📊 Market Prices ({marketPrices.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/kg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {marketPrices.slice(0, 10).map(price => (
                      <tr key={price.price_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{price.price_id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{price.crop}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{price.price_date}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {Number(price.price_per_kg).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{price.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {marketPrices.length > 10 && (
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                    Hiển thị 10/{marketPrices.length} market prices
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* No Data Message */}
        {roles.length === 0 && users.length === 0 && provinces.length === 0 && crops.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">Chưa Có Dữ Liệu</h2>
            <p className="text-yellow-700">
              Database chưa có dữ liệu. Hãy chạy seed script để thêm dữ liệu mẫu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
