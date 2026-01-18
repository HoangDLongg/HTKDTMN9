/**
 * Market Prices Page - Giá Thị Trường
 * Hiển thị giá cả các loại cây trồng
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getLatestMarketPrices, groupPricesByCrop, type PriceByCrop } from '@/lib/market-service';
import type { MarketPrice } from '@/types';
import Link from 'next/link';

export default function MarketPricesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [groupedPrices, setGroupedPrices] = useState<PriceByCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('');

      const pricesData = await getLatestMarketPrices();
      setPrices(pricesData);
      
      const grouped = groupPricesByCrop(pricesData);
      setGroupedPrices(grouped);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
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

  const getPriceChangeColor = (change?: number) => {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPriceChangeIcon = (change?: number) => {
    if (!change) return '—';
    return change > 0 ? '📈' : '📉';
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
              <h1 className="text-2xl font-bold text-gray-900">📊 Giá Thị Trường</h1>
              <p className="text-sm text-gray-600">
                Cập nhật: {groupedPrices.length > 0 ? formatDate(groupedPrices[0].latestPrice.price_date) : 'N/A'}
              </p>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{groupedPrices.length}</div>
            <div className="text-sm text-gray-600">Loại cây</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {groupedPrices.filter(p => p.priceChange && p.priceChange > 0).length}
            </div>
            <div className="text-sm text-gray-600">Giá tăng</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {groupedPrices.filter(p => p.priceChange && p.priceChange < 0).length}
            </div>
            <div className="text-sm text-gray-600">Giá giảm</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">
              {groupedPrices.filter(p => !p.priceChange || p.priceChange === 0).length}
            </div>
            <div className="text-sm text-gray-600">Ổn định</div>
          </div>
        </div>

        {/* Price Cards */}
        {groupedPrices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có dữ liệu giá</h2>
            <p className="text-gray-600">
              Hệ thống đang cập nhật giá thị trường
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedPrices.map((item) => (
              <div
                key={item.cropId}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                  <h3 className="text-xl font-bold">{item.cropName}</h3>
                  <p className="text-sm opacity-90">
                    {item.latestPrice.market_location || 'Thị trường chung'}
                  </p>
                </div>

                {/* Body */}
                <div className="p-4">
                  {/* Average Price */}
                  <div className="text-center mb-4 pb-4 border-b border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Giá trung bình</div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatPrice(item.latestPrice.price_avg)}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Giá thấp nhất</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.latestPrice.price_min)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Giá cao nhất</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.latestPrice.price_max)}
                      </div>
                    </div>
                  </div>

                  {/* Price Change */}
                  {item.priceChange !== undefined && (
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                      item.priceChange > 0 ? 'bg-green-50' : item.priceChange < 0 ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <span className="text-2xl">{getPriceChangeIcon(item.priceChange)}</span>
                      <span className={`font-semibold ${getPriceChangeColor(item.priceChange)}`}>
                        {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                      </span>
                      <span className="text-sm text-gray-600">so với hôm qua</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                    Cập nhật: {formatDate(item.latestPrice.price_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">Lưu ý</h3>
              <p className="text-sm text-blue-800">
                Giá cả có thể thay đổi theo từng thời điểm và thị trường. 
                Vui lòng liên hệ với hợp tác xã để được tư vấn cụ thể về giá thu mua.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
