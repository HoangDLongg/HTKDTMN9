/**
 * Seasons API Service
 * Quản lý mùa vụ và công việc
 */

import { apiClient } from './api';
import type { Season, DailyTask, FarmingLog, PaginatedResponse } from '@/types';

/**
 * Lấy tất cả mùa vụ của nông dân (qua farmer_id)
 */
export async function getSeasonsByFarmerId(farmerId: number): Promise<Season[]> {
  try {
    // Get all farms của farmer trước
    const farmsResponse = await apiClient.get<PaginatedResponse<{ id: number }>>('/farms/', {
      farmer: farmerId,
    });
    
    if (!farmsResponse.results || farmsResponse.results.length === 0) {
      return [];
    }
    
    // Get seasons của tất cả farms
    const farmIds = farmsResponse.results.map(f => f.id);
    const seasonsMap = new Map<number, Season>();
    
    for (const farmId of farmIds) {
      const response = await apiClient.get<PaginatedResponse<Season>>('/seasons/', {
        farm: farmId,
      });
      if (response.results) {
        // Deduplicate by season ID
        response.results.forEach(season => {
          seasonsMap.set(season.id, season);
        });
      }
    }
    
    return Array.from(seasonsMap.values());
  } catch (error) {
    console.error('Error getting seasons:', error);
    return [];
  }
}

/**
 * Lấy chi tiết một mùa vụ
 */
export async function getSeasonById(seasonId: number): Promise<Season | null> {
  try {
    return await apiClient.get<Season>(`/seasons/${seasonId}/`);
  } catch (error) {
    console.error('Error getting season:', error);
    return null;
  }
}

/**
 * Lấy công việc của một mùa vụ
 */
export async function getDailyTasksBySeasonId(seasonId: number): Promise<DailyTask[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<DailyTask>>('/daily-tasks/', {
      season: seasonId,
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting daily tasks:', error);
    return [];
  }
}

/**
 * Lấy nhật ký canh tác của một mùa vụ
 */
export async function getFarmingLogsBySeasonId(seasonId: number): Promise<FarmingLog[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<FarmingLog>>('/farming-logs/', {
      season: seasonId,
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting farming logs:', error);
    return [];
  }
}

/**
 * Đánh dấu công việc hoàn thành
 */
export async function completeTask(taskId: number, notes?: string): Promise<boolean> {
  try {
    await apiClient.patch(`/daily-tasks/${taskId}/`, {
      is_completed: true,
      completed_at: new Date().toISOString(),
      notes,
    });
    return true;
  } catch (error) {
    console.error('Error completing task:', error);
    return false;
  }
}

/**
 * Tạo nhật ký canh tác mới
 */
export async function createFarmingLog(data: {
  season: number;
  daily_task?: number;
  log_date: string;
  activity_type?: string;
  description?: string;
  materials_used?: string;
  quantity_used?: string;
  cost?: number;
  weather_condition?: string;
}): Promise<FarmingLog | null> {
  try {
    return await apiClient.post<FarmingLog>('/farming-logs/', data);
  } catch (error) {
    console.error('Error creating farming log:', error);
    return null;
  }
}

/**
 * Thống kê mùa vụ
 */
export interface SeasonStats {
  total: number;
  active: number;
  planned: number;
  completed: number;
  failed: number;
}

export function calculateSeasonStats(seasons: Season[]): SeasonStats {
  return {
    total: seasons.length,
    active: seasons.filter(s => s.status === 'in_progress').length,
    planned: seasons.filter(s => s.status === 'planning').length,
    completed: seasons.filter(s => s.status === 'completed').length,
    failed: seasons.filter(s => s.status === 'failed').length,
  };
}

/**
 * Thống kê công việc
 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export function calculateTaskStats(tasks: DailyTask[]): TaskStats {
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.is_completed).length,
    pending: tasks.filter(t => !t.is_completed).length,
    overdue: tasks.filter(t => !t.is_completed && new Date(t.due_date) < now).length,
  };
}
