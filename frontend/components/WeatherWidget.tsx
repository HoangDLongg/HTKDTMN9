/**
 * Weather Widget Component
 * Hiển thị thông tin thời tiết và tư vấn nông nghiệp
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  getCurrentWeather, 
  getWeatherIconUrl, 
  getWindDirection,
  getAgricultureAdvice,
  type WeatherData 
} from '@/lib/weather-service';
import { getSavedLocation, getLocationFromIP } from '@/lib/location-service';

interface WeatherWidgetProps {
  city?: string;
  autoDetect?: boolean;
}

export default function WeatherWidget({ city, autoDetect = true }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState(city || 'Ho Chi Minh');
  const [searchCity, setSearchCity] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    initializeCity();
  }, []);

  useEffect(() => {
    if (currentCity) {
      fetchWeather();
      // Refresh every 30 minutes
      const interval = setInterval(fetchWeather, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentCity]);

  const initializeCity = async () => {
    if (!autoDetect || city) {
      setCurrentCity(city || 'Ho Chi Minh');
      return;
    }

    // Try to get location from localStorage first
    let location = getSavedLocation();
    
    // If not found, get from IP
    if (!location) {
      location = await getLocationFromIP();
    }
    
    if (location) {
      setCurrentCity(location.city);
    } else {
      setCurrentCity('Ho Chi Minh');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCurrentCity(searchCity.trim());
      setSearchCity('');
    }
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentWeather(currentCity);
      setWeather(data);
    } catch (err: any) {
      setError('Không thể tải thông tin thời tiết');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse flex gap-3">
          <div className="h-12 w-12 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-red-600 text-sm">{error || 'Lỗi tải thời tiết'}</div>
      </div>
    );
  }

  const advice = getAgricultureAdvice(weather);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Compact Header */}
      <div className="p-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Tìm địa điểm..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Main Info - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.description}
              className="w-16 h-16"
            />
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {weather.description}
              </div>
              <div className="text-xs text-gray-500">{weather.city}</div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}
          </button>
        </div>

        {/* Agriculture Advice - Always visible */}
        <div className={`mt-3 bg-${advice.color}-50 border border-${advice.color}-200 rounded-lg p-3`}>
          <div className="font-bold text-gray-900 text-sm mb-1">
            {advice.warning}
          </div>
          <div className="text-xs text-gray-700">
            {advice.advice}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xs text-gray-600">Độ ẩm</div>
              <div className="text-sm font-semibold text-gray-900">{weather.humidity}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Gió</div>
              <div className="text-sm font-semibold text-gray-900">{weather.wind_speed} m/s</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Cảm giác</div>
              <div className="text-sm font-semibold text-gray-900">{weather.feels_like}°C</div>
            </div>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={fetchWeather}
          className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 py-1"
        >
          🔄 Cập nhật lúc {new Date(weather.dt * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </button>
      </div>
    </div>
  );
}
