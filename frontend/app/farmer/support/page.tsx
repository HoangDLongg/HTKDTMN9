'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatBot from '@/components/ChatBot';
import dynamic from 'next/dynamic';
const NotificationBell = dynamic(() => import('@/components/NotificationBell'), { ssr: false });

export default function SupportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              ← Quay lại
            </button>
            <NotificationBell />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Trợ Giúp & Hỗ Trợ
          </h1>
          <p className="text-gray-600">
            Đặt câu hỏi và nhận câu trả lời ngay lập tức từ trợ lý AI
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Phản hồi nhanh</h3>
            <p className="text-sm text-gray-600">
              Trả lời ngay lập tức dựa trên dữ liệu thực tế
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Thông tin chính xác</h3>
            <p className="text-sm text-gray-600">
              Dữ liệu từ hệ thống và FAQ được cập nhật
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Hỗ trợ đa dạng</h3>
            <p className="text-sm text-gray-600">
              Giá cả, công việc, khuyến nghị và nhiều hơn nữa
            </p>
          </div>
        </div>

        {/* ChatBot */}
        <ChatBot />

        {/* Footer Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            ℹ️ Hướng dẫn sử dụng
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Đặt câu hỏi bằng ngôn ngữ tự nhiên tiếng Việt</li>
            <li>• Sử dụng các nút gợi ý để bắt đầu nhanh</li>
            <li>• Gõ "trợ giúp" để xem danh sách các câu hỏi</li>
            <li>• Bot sẽ truy vấn dữ liệu từ hệ thống của bạn</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
