/**
 * Market API Service
 * Quản lý giá thị trường và đề xuất cây trồng
 */

import { apiClient } from './api';
import type { MarketPrice, PlantingRecommendation, SeasonRegistration, PaginatedResponse } from '@/types';

/**
 * Lấy giá thị trường mới nhất
 */
export async function getLatestMarketPrices(): Promise<MarketPrice[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<MarketPrice>>('/market-prices/', {
      ordering: '-price_date',
      limit: 50,
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting market prices:', error);
    return [];
  }
}

/**
 * Lấy giá của một loại cây trong khoảng thời gian
 */
export async function getPricesByCrop(cropId: number, days: number = 30): Promise<MarketPrice[]> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const response = await apiClient.get<PaginatedResponse<MarketPrice>>('/market-prices/', {
      crop: cropId,
      price_date__gte: fromDate.toISOString().split('T')[0],
      ordering: '-price_date',
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting crop prices:', error);
    return [];
  }
}

/**
 * Lấy danh sách đề xuất cây trồng đang active
 */
export async function getActiveRecommendations(): Promise<PlantingRecommendation[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<PlantingRecommendation>>('/planting-recommendations/', {
      status: 'active',
      ordering: '-created_at',
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Lấy chi tiết một đề xuất
 */
export async function getRecommendationById(id: number): Promise<PlantingRecommendation | null> {
  try {
    return await apiClient.get<PlantingRecommendation>(`/planting-recommendations/${id}/`);
  } catch (error) {
    console.error('Error getting recommendation:', error);
    return null;
  }
}

/**
 * Đăng ký tham gia vụ mùa theo đề xuất
 */
export async function registerForRecommendation(data: {
  recommendation_id: number;
  farm_id: number;
  area_registered: number;
}): Promise<SeasonRegistration | null> {
  try {
    return await apiClient.post<SeasonRegistration>('/season-registrations/', data);
  } catch (error) {
    console.error('Error registering for recommendation:', error);
    return null;
  }
}

/**
 * Lấy danh sách đăng ký của nông dân
 */
export async function getFarmerRegistrations(farmerId: number): Promise<SeasonRegistration[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<SeasonRegistration>>('/season-registrations/', {
      farmer: farmerId,
      ordering: '-created_at',
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting registrations:', error);
    return [];
  }
}

/**
 * Group market prices by crop
 */
export interface PriceByCrop {
  cropId: number;
  cropName: string;
  latestPrice: MarketPrice;
  priceHistory: MarketPrice[];
  priceChange?: number; // % change from previous
}

export function groupPricesByCrop(prices: MarketPrice[]): PriceByCrop[] {
  const grouped = new Map<number, MarketPrice[]>();
  
  prices.forEach(price => {
    if (!price.crop) return;
    const existing = grouped.get(price.crop) || [];
    existing.push(price);
    grouped.set(price.crop, existing);
  });
  
  const result: PriceByCrop[] = [];
  grouped.forEach((priceList, cropId) => {
    // Sort by date descending
    priceList.sort((a, b) => new Date(b.price_date).getTime() - new Date(a.price_date).getTime());
    
    const latest = priceList[0];
    const previous = priceList[1];
    
    let priceChange: number | undefined;
    if (latest.price_avg && previous?.price_avg) {
      priceChange = ((parseFloat(latest.price_avg) - parseFloat(previous.price_avg)) / parseFloat(previous.price_avg)) * 100;
    }
    
    result.push({
      cropId,
      cropName: latest.crop_details?.name || 'N/A',
      latestPrice: latest,
      priceHistory: priceList,
      priceChange,
    });
  });
  
  return result;
}
