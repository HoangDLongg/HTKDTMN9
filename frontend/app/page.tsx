/**
 * Main Dashboard Page
 * Overview of the agricultural supply chain system
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🌾 Hệ Thống Quản Lý Chuỗi Cung Ứng Nông Nghiệp
          </h1>
          <p className="text-xl text-gray-600">
            Giải pháp quản lý thông minh với AI dự báo và chatbot hỗ trợ
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">23</div>
            <div className="text-gray-600">Models</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">7</div>
            <div className="text-gray-600">Apps</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-600">API Endpoints</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-gray-600">Ready</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Core Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quản Lý Người Dùng
            </h2>
            <p className="text-gray-600 mb-4">
              Users, Roles, Authentication
            </p>
            <Link 
              href="/users" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>

          {/* Location Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Vị Trí Địa Lý
            </h2>
            <p className="text-gray-600 mb-4">
              63 Tỉnh/Thành, Quận/Huyện, Phường/Xã
            </p>
            <Link 
              href="/locations" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>

          {/* Crop Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🌱</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quản Lý Cây Trồng
            </h2>
            <p className="text-gray-600 mb-4">
              Crops, Quy Trình Kỹ Thuật
            </p>
            <Link 
              href="/crops" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>

          {/* Farm Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🏡</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quản Lý Nông Trại
            </h2>
            <p className="text-gray-600 mb-4">
              Hợp Tác Xã, Nông Dân, Vườn/Ruộng
            </p>
            <Link 
              href="/farms" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>

          {/* Season Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🗓️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quản Lý Vụ Mùa
            </h2>
            <p className="text-gray-600 mb-4">
              Seasons, Tasks, Timeline Auto
            </p>
            <Link 
              href="/seasons" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>

          {/* Market Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Phân Tích Thị Trường
            </h2>
            <p className="text-gray-600 mb-4">
              Giá, Xu Hướng, Dự Báo AI
            </p>
            <Link 
              href="/market" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">📚 API Documentation</h2>
          <p className="mb-6">
            Khám phá tất cả API endpoints và tích hợp vào ứng dụng của bạn
          </p>
          <div className="flex gap-4">
            <a
              href="http://127.0.0.1:8000/api/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Swagger UI
            </a>
            <a
              href="http://127.0.0.1:8000/api/redoc/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              ReDoc
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <p>Agricultural Supply Chain Management System v1.0.0</p>
          <p className="mt-2">Django 6.0.1 + Next.js + PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}

