/**
 * Weather API Service
 * Kết nối với OpenWeatherMap API để lấy thông tin thời tiết
 */

const API_KEY = "8e054550351ac98ddb1c99ddb6e5adcd";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  city: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  visibility: number;
  dt: number;
}

export interface ForecastData {
  list: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    weather: Array<{
      description: string;
      icon: string;
    }>;
    pop: number; // Probability of precipitation
    dt_txt: string;
  }>;
}

/**
 * Lấy thông tin thời tiết hiện tại
 */
export async function getCurrentWeather(city: string = "Ho Chi Minh"): Promise<WeatherData> {
  try {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=vi`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min),
      temp_max: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      clouds: data.clouds.all,
      visibility: data.visibility,
      dt: data.dt,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

/**
 * Lấy dự báo thời tiết 5 ngày
 */
export async function getWeatherForecast(city: string = "Ho Chi Minh"): Promise<ForecastData> {
  try {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=vi`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      list: data.list.map((item: any) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        feels_like: Math.round(item.main.feels_like),
        temp_min: Math.round(item.main.temp_min),
        temp_max: Math.round(item.main.temp_max),
        humidity: item.main.humidity,
        weather: item.weather,
        pop: Math.round(item.pop * 100), // Convert to percentage
        dt_txt: item.dt_txt,
      })),
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Lấy icon URL từ OpenWeatherMap
 */
export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

/**
 * Chuyển đổi hướng gió từ độ sang hướng
 */
export function getWindDirection(deg: number): string {
  const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

/**
 * Phân tích thời tiết cho nông nghiệp
 */
export function getAgricultureAdvice(weather: WeatherData): {
  warning: string;
  advice: string;
  color: string;
} {
  const { temperature, humidity, wind_speed, description } = weather;
  
  // Cảnh báo mưa
  if (description.includes('mưa') || description.includes('rain')) {
    return {
      warning: '⚠️ Có mưa',
      advice: 'Tránh phun thuốc, hoãn thu hoạch nếu có thể. Kiểm tra hệ thống thoát nước.',
      color: 'blue',
    };
  }
  
  // Cảnh báo nhiệt độ cao
  if (temperature > 35) {
    return {
      warning: '🌡️ Nhiệt độ cao',
      advice: 'Tăng tưới nước, che chắn cho cây non. Tránh làm việc ngoài trời vào giữa trưa.',
      color: 'red',
    };
  }
  
  // Cảnh báo gió mạnh
  if (wind_speed > 10) {
    return {
      warning: '💨 Gió mạnh',
      advice: 'Kiểm tra giàn đỡ, che chắn cây trồng. Tránh phun thuốc.',
      color: 'orange',
    };
  }
  
  // Cảnh báo độ ẩm thấp
  if (humidity < 40) {
    return {
      warning: '🏜️ Độ ẩm thấp',
      advice: 'Tăng tưới nước, sử dụng màng phủ giữ ẩm.',
      color: 'yellow',
    };
  }
  
  // Thời tiết tốt
  return {
    warning: '☀️ Thời tiết thuận lợi',
    advice: 'Thời điểm tốt cho phun thuốc, bón phân và thu hoạch.',
    color: 'green',
  };
}
