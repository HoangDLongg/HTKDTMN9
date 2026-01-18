/**
 * Dashboard Pages for different roles
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import WeatherWidget from '@/components/WeatherWidget';
import dynamic from 'next/dynamic';

const NotificationBell = dynamic(() => import('@/components/NotificationBell'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin, isCooperative, isFarmer } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl">🌾</Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isAdmin && '👨‍💼 Admin Dashboard'}
                {isCooperative && '🏢 Dashboard Hợp Tác Xã'}
                {isFarmer && '👨‍🌾 Dashboard Người Dân'}
              </h1>
              <p className="text-sm text-gray-600">Xin chào, {user.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Admin Dashboard */}
        {isAdmin && (
          <div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-2">Quản Lý Hệ Thống</h2>
              <p className="text-lg">Toàn quyền quản lý người dùng, dữ liệu và cấu hình hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Người Dùng</h3>
                <p className="text-gray-600">Quản lý tài khoản và phân quyền</p>
              </Link>

              <Link href="/admin/cooperatives" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hợp Tác Xã</h3>
                <p className="text-gray-600">Quản lý các hợp tác xã</p>
              </Link>

              <Link href="/admin/crops" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🌱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cây Trồng</h3>
                <p className="text-gray-600">Quản lý danh mục cây trồng</p>
              </Link>

              <Link href="/admin/technical-processes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quy Trình Kỹ Thuật</h3>
                <p className="text-gray-600">Quản lý quy trình canh tác</p>
              </Link>

              {/* <Link href="/admin/seasons" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🗓️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vụ Mùa</h3>
                <p className="text-gray-600">Theo dõi tất cả vụ mùa</p>
              </Link> */}

              <Link href="/admin/market" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thị Trường</h3>
                <p className="text-gray-600">Phân tích giá và xu hướng</p>
              </Link>

              {/* <Link href="/admin/reports" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Báo Cáo</h3>
                <p className="text-gray-600">Thống kê và báo cáo tổng hợp</p>
              </Link> */}
            </div>
          </div>
        )}

        {/* Cooperative Dashboard */}
        {isCooperative && (
          <div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-2">Quản Lý Hợp Tác Xã</h2>
              <p className="text-lg">Quản lý nông dân, sản xuất và tiêu thụ sản phẩm</p>
            </div>

            {/* Weather Widget */}
            <div className="mb-8">
              <WeatherWidget autoDetect={true} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/cooperative/farmers" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">👨‍🌾</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nông Dân</h3>
                <p className="text-gray-600">Quản lý danh sách nông dân</p>
              </Link>



              <Link href="/cooperative/seasons" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🗓️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vụ Mùa</h3>
                <p className="text-gray-600">Theo dõi tiến độ các vụ</p>
              </Link>

              {/* <Link href="/cooperative/production" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sản Lượng</h3>
                <p className="text-gray-600">Thống kê sản lượng</p>
              </Link> */}

              <Link href="/cooperative/documents" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tài Liệu</h3>
                <p className="text-gray-600">Tài liệu kỹ thuật cây trồng</p>
              </Link>

              <Link href="/cooperative/care-timeline" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🌱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lộ trình chăm sóc</h3>
                <p className="text-gray-600">Quy trình kỹ thuật chi tiết</p>
              </Link>

              <Link href="/cooperative/analytics" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-white">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-xl font-bold mb-2">Thống kê & Báo cáo</h3>
                <p className="text-blue-100">Dashboard Metabase</p>
              </Link>

              <Link href="/cooperative/support" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hỗ Trợ</h3>
                <p className="text-gray-600">Hỗ trợ nông dân</p>
              </Link>
            </div>
          </div>
        )}

        {/* Farmer Dashboard */}
        {isFarmer && (
          <div>
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-lg p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-2">Quản Lý Canh Tác</h2>
              <p className="text-lg">Theo dõi vườn, vụ mùa và công việc hàng ngày</p>
            </div>

            {/* Weather Widget */}
            <div className="mb-8">
              <WeatherWidget autoDetect={true} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/farmer/farms" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🏡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vườn Của Tôi</h3>
                <p className="text-gray-600">Quản lý các vườn canh tác</p>
              </Link>

              <Link href="/farmer/seasons" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🗓️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vụ Mùa</h3>
                <p className="text-gray-600">Theo dõi các vụ đang trồng</p>
              </Link>
              <Link href="/farmer/tasks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Công Việc</h3>
                <p className="text-gray-600">Danh sách việc hàng ngày</p>
              </Link>
              <Link href="/farmer/recommendations" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đề Xuất Cây Trồng</h3>
                <p className="text-gray-600">Từ hợp tác xã</p>
              </Link>

              <Link href="/farmer/tasks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Công Việc</h3>
                <p className="text-gray-600">Công việc hàng ngày</p>
              </Link>

              <Link href="/farmer/logs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nhật Ký</h3>
                <p className="text-gray-600">Ghi chú canh tác</p>
              </Link>

              <Link href="/farmer/market" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Giá Thị Trường</h3>
                <p className="text-gray-600">Tra cứu giá cả</p>
              </Link>

              <Link href="/farmer/analytics" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-white">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-xl font-bold mb-2">Thống kê & Báo cáo</h3>
                <p className="text-purple-100">Dashboard Metabase</p>
              </Link>

              <Link href="/farmer/support" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trợ Giúp</h3>
                <p className="text-gray-600">Chatbot & FAQ</p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
