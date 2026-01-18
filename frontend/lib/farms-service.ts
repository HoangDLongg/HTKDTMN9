/**
 * Farms API Service
 * Quản lý vườn của nông dân
 */

import { apiClient } from './api';
import type { Farm, Farmer, Season, PaginatedResponse } from '@/types';

/**
 * Lấy thông tin farmer từ user_id
 */
export async function getFarmerByUserId(userId: number): Promise<Farmer | null> {
  try {
    const response = await apiClient.get<PaginatedResponse<Farmer>>('/farmers/', {
      user: userId,
    });
    
    if (response.results && response.results.length > 0) {
      return response.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting farmer:', error);
    return null;
  }
}

/**
 * Lấy danh sách vườn của farmer
 */
export async function getFarmsByFarmerId(farmerId: number): Promise<Farm[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Farm>>('/farms/', {
      farmer: farmerId,
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting farms:', error);
    return [];
  }
}

/**
 * Lấy chi tiết một vườn
 */
export async function getFarmById(farmId: number): Promise<Farm | null> {
  try {
    return await apiClient.get<Farm>(`/farms/${farmId}/`);
  } catch (error) {
    console.error('Error getting farm:', error);
    return null;
  }
}

/**
 * Lấy các vụ mùa của một vườn
 */
export async function getSeasonsByFarmId(farmId: number): Promise<Season[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Season>>('/seasons/', {
      farm: farmId,
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting seasons:', error);
    return [];
  }
}

/**
 * Tạo vườn mới
 */
export async function createFarm(data: {
  farmer: number;
  name: string;
  area_hectare: number;
  ward?: number;
  soil_type?: string;
  water_source?: string;
  location_lat?: number;
  location_lng?: number;
}): Promise<Farm> {
  return await apiClient.post<Farm>('/farms/', data);
}

/**
 * Cập nhật vườn
 */
export async function updateFarm(farmId: number, data: Partial<Farm>): Promise<Farm> {
  return await apiClient.put<Farm>(`/farms/${farmId}/`, data);
}

/**
 * Xóa vườn
 */
export async function deleteFarm(farmId: number): Promise<void> {
  await apiClient.delete(`/farms/${farmId}/`);
}

/**
 * Tính toán thống kê vườn
 */
export function calculateFarmStats(farms: Farm[], seasons: Season[]) {
  const totalArea = farms.reduce((sum, farm) => sum + Number(farm.area_hectare || 0), 0);
  const activeFarms = seasons.filter(s => s.status === 'in_progress').length;
  
  return {
    totalFarms: farms.length,
    totalArea: totalArea.toFixed(2),
    activeFarms,
    idleFarms: farms.length - activeFarms,
  };
}
