/**
 * Login Page
 * Authentication for Admin, Cooperative, and Farmer roles
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      
      // Redirect based on role will be handled by middleware
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts info
  const demoAccounts = [
    { role: 'Admin', username: 'admin', password: 'admin123', icon: '👨‍💼', color: 'blue' },
    { role: 'Hợp tác xã', username: 'htx_manager', password: 'htx123', icon: '🏢', color: 'green' },
    { role: 'Người dân', username: 'farmer1', password: 'farmer123', icon: '👨‍🌾', color: 'orange' },
  ];

  const fillDemo = (username: string, password: string) => {
    setUsername(username);
    setPassword(password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8">
        {/* Left Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌾</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng Nhập
            </h1>
            <p className="text-gray-600">
              Hệ thống Quản lý Chuỗi Cung Ứng Nông Nghiệp
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-700 text-sm">
              ← Về trang chủ
            </a>
          </div>
        </div>

        {/* Right Side - Demo Accounts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🔑 Tài Khoản Demo
            </h2>
            <p className="text-base text-gray-700 mb-6 font-medium">
              Chọn một tài khoản để đăng nhập nhanh
            </p>

            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.username}
                  onClick={() => fillDemo(account.username, account.password)}
                  className="w-full text-left p-4 border-2 border-gray-300 bg-white rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{account.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg">{account.role}</div>
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-mono font-semibold">{account.username}</span> / <span className="font-mono font-semibold">{account.password}</span>
                      </div>
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-700 font-bold text-xl">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">✨ Tính Năng Hệ Thống</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-2xl">👨‍💼</span>
                <div>
                  <div className="font-bold text-gray-900 text-base">Admin</div>
                  <div className="text-gray-700 text-sm">Quản lý toàn bộ hệ thống</div>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-2xl">🏢</span>
                <div>
                  <div className="font-bold text-gray-900 text-base">Hợp tác xã</div>
                  <div className="text-gray-700 text-sm">Quản lý nông dân và sản xuất</div>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-2xl">👨‍🌾</span>
                <div>
                  <div className="font-bold text-gray-900 text-base">Người dân</div>
                  <div className="text-gray-700 text-sm">Quản lý vườn và vụ mùa</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
