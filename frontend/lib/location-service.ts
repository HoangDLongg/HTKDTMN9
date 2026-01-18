/**
 * Location Service
 * Lấy vị trí địa lý từ IP address
 */

export interface LocationData {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

/**
 * Lấy vị trí từ IP (sử dụng ipapi.co - free API)
 * Cache 24h để tránh rate limit
 */
export async function getLocationFromIP(): Promise<LocationData | null> {
  const CACHE_KEY = 'ip_location_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Using cached location data');
        return data;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }

  // Default location (fallback)
  const defaultLocation: LocationData = {
    city: 'Ho Chi Minh',
    region: 'Ho Chi Minh',
    country: 'Vietnam',
    lat: 10.8231,
    lon: 106.6297,
    timezone: 'Asia/Ho_Chi_Minh',
  };

  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    // Handle rate limit (429)
    if (response.status === 429) {
      console.warn('IP API rate limit reached, using default location');
      return defaultLocation;
    }

    if (!response.ok) {
      console.warn('Cannot get location from IP:', response.statusText);
      return defaultLocation;
    }

    const data = await response.json();

    const locationData: LocationData = {
      city: data.city || 'Ho Chi Minh',
      region: data.region || 'Ho Chi Minh',
      country: data.country_name || 'Vietnam',
      lat: data.latitude || 10.8231,
      lon: data.longitude || 106.6297,
      timezone: data.timezone || 'Asia/Ho_Chi_Minh',
    };

    // Cache the result
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: locationData,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore storage errors
    }

    return locationData;
  } catch (error) {
    console.warn('Error getting location from IP, using default:', error);
    return defaultLocation;
  }
}

/**
 * Lưu vị trí vào localStorage
 */
export function saveLocation(location: LocationData): void {
  localStorage.setItem('userLocation', JSON.stringify(location));
}

/**
 * Lấy vị trí từ localStorage
 */
export function getSavedLocation(): LocationData | null {
  const saved = localStorage.getItem('userLocation');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Lấy vị trí từ user profile (nếu có)
 */
export function getLocationFromUser(user: any): string {
  // Nếu user có province_details, dùng tên tỉnh
  if (user.province_details?.province_name) {
    return user.province_details.province_name;
  }

  // Fallback
  return 'Ho Chi Minh';
}
