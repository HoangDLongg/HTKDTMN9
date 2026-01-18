/**
 * Season Detail Page - Chi tiết mùa vụ
 * Hiển thị thông tin mùa vụ, công việc và nhật ký canh tác
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getSeasonById, getDailyTasksBySeasonId, getFarmingLogsBySeasonId, completeTask, calculateTaskStats } from '@/lib/seasons-service';
import type { Season, DailyTask, FarmingLog } from '@/types';
import Link from 'next/link';

export default function SeasonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const seasonId = parseInt(params.id as string);
  
  const [season, setSeason] = useState<Season | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [logs, setLogs] = useState<FarmingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'logs'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && seasonId) {
      loadData();
    }
  }, [user, authLoading, seasonId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [seasonData, tasksData, logsData] = await Promise.all([
        getSeasonById(seasonId),
        getDailyTasksBySeasonId(seasonId),
        getFarmingLogsBySeasonId(seasonId)
      ]);

      if (!seasonData) {
        setError('Không tìm thấy thông tin mùa vụ');
        setLoading(false);
        return;
      }

      setSeason(seasonData);
      setTasks(tasksData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const success = await completeTask(taskId);
    if (success) {
      // Reload tasks
      const tasksData = await getDailyTasksBySeasonId(seasonId);
      setTasks(tasksData);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planning: '📋 Lên kế hoạch',
      in_progress: '🌱 Đang trồng',
      completed: '✅ Hoàn thành',
      failed: '❌ Thất bại',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = () => {
    if (!season?.start_date || !season?.expected_harvest_date) return 0;
    const start = new Date(season.start_date).getTime();
    const end = new Date(season.expected_harvest_date).getTime();
    const now = new Date().getTime();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateDaysRemaining = () => {
    if (!season?.expected_harvest_date) return null;
    const now = new Date();
    const expected = new Date(season.expected_harvest_date);
    const diffTime = expected.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (error || !season) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link href="/farmer/seasons" className="text-green-600 hover:text-green-700">
              ← Quay lại danh sách mùa vụ
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">{error || 'Không tìm thấy mùa vụ'}</h2>
          </div>
        </main>
      </div>
    );
  }

  const progress = calculateProgress();
  const daysRemaining = calculateDaysRemaining();
  const taskStats = calculateTaskStats(tasks);

  // Group tasks by status
  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/farmer/seasons"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            ← Quay lại danh sách mùa vụ
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {season.crop_details?.name || season.crop_name || 'N/A'}
              </h1>
              <p className="text-sm text-gray-600">{season.season_code}</p>
              <p className="text-sm text-gray-600">{season.farm_name || `Farm #${season.farm}`}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(season.status)}`}>
              {getStatusText(season.status)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✅ Công việc ({taskStats.pending})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Nhật ký ({logs.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Thông tin</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Ngày bắt đầu</div>
                    <div className="text-gray-900">{formatDate(season.start_date)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Dự kiến thu hoạch</div>
                    <div className="text-gray-900">{formatDate(season.expected_harvest_date)}</div>
                  </div>

                  {season.actual_harvest_date && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Đã thu hoạch</div>
                      <div className="text-green-600 font-medium">{formatDate(season.actual_harvest_date)}</div>
                    </div>
                  )}

                  {season.area_planted && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Diện tích trồng</div>
                      <div className="text-gray-900">{season.area_planted} m²</div>
                    </div>
                  )}

                  {season.expected_yield && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Năng suất dự kiến</div>
                      <div className="text-gray-900">{season.expected_yield} tấn</div>
                    </div>
                  )}

                  {season.actual_yield && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Năng suất thực tế</div>
                      <div className="text-green-600 font-bold text-lg">{season.actual_yield} tấn</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {season.status === 'in_progress' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">⏱️ Tiến độ</h2>
                  
                  {daysRemaining !== null && (
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600">{daysRemaining}</div>
                      <div className="text-sm text-gray-600">ngày còn lại</div>
                    </div>
                  )}

                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Đã qua</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {season.notes && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Ghi chú</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{season.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-2">
              {/* Task Stats */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">✅ Tình hình công việc</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                    <div className="text-sm text-gray-600">Tổng</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                    <div className="text-sm text-gray-600">Hoàn thành</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{taskStats.pending}</div>
                    <div className="text-sm text-gray-600">Chưa làm</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                    <div className="text-sm text-gray-600">Trễ hạn</div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              {pendingTasks.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">🔔 Công việc sắp tới</h2>
                  
                  <div className="space-y-3">
                    {pendingTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleCompleteTask(task.id)}
                          className="mt-1 w-5 h-5 text-green-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{task.task_name}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Hạn: {formatDate(task.due_date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pendingTasks.length > 5 && (
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="w-full mt-4 text-center text-green-600 hover:text-green-700 font-medium"
                    >
                      Xem tất cả ({pendingTasks.length} công việc) →
                    </button>
                  )}
                </div>
              )}

              {/* Recent Logs */}
              {sortedLogs.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Nhật ký gần đây</h2>
                  
                  <div className="space-y-4">
                    {sortedLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="border-l-4 border-green-600 pl-4 py-2">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-gray-900">
                            {log.activity_type || 'Hoạt động'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(log.log_date)}
                          </div>
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-700">{log.description}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {sortedLogs.length > 5 && (
                    <button
                      onClick={() => setActiveTab('logs')}
                      className="w-full mt-4 text-center text-green-600 hover:text-green-700 font-medium"
                    >
                      Xem tất cả ({sortedLogs.length} nhật ký) →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  📌 Công việc cần làm ({pendingTasks.length})
                </h2>
                
                <div className="space-y-3">
                  {pendingTasks.map(task => {
                    const isOverdue = new Date(task.due_date) < new Date();
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg ${
                          isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleCompleteTask(task.id)}
                          className="mt-1 w-5 h-5 text-green-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-gray-900">{task.task_name}</div>
                            {isOverdue && (
                              <span className="text-xs font-semibold text-red-600 px-2 py-1 bg-red-100 rounded">
                                Trễ hạn
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Hạn: {formatDate(task.due_date)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  ✅ Đã hoàn thành ({completedTasks.length})
                </h2>
                
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg opacity-75">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="mt-1 w-5 h-5 text-green-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-700 line-through">{task.task_name}</div>
                        {task.completed_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Hoàn thành: {formatDateTime(task.completed_at)}
                          </div>
                        )}
                        {task.notes && (
                          <div className="text-sm text-gray-600 mt-1 italic">{task.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có công việc nào</h2>
                <p className="text-gray-600">
                  Công việc sẽ được tự động tạo dựa trên quy trình kỹ thuật
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              📝 Nhật ký canh tác ({logs.length})
            </h2>
            
            {sortedLogs.length > 0 ? (
              <div className="space-y-4">
                {sortedLogs.map(log => (
                  <div key={log.id} className="border-l-4 border-green-600 pl-4 py-3 bg-gray-50 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {log.activity_type || 'Hoạt động'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(log.log_date)}
                        </div>
                      </div>
                      {log.cost && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Chi phí</div>
                          <div className="font-semibold text-red-600">
                            {parseFloat(log.cost).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      )}
                    </div>

                    {log.description && (
                      <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                    )}

                    {(log.materials_used || log.quantity_used || log.weather_condition) && (
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200 text-sm">
                        {log.materials_used && (
                          <div>
                            <span className="text-gray-600">Vật tư: </span>
                            <span className="text-gray-900">{log.materials_used}</span>
                          </div>
                        )}
                        {log.quantity_used && (
                          <div>
                            <span className="text-gray-600">Số lượng: </span>
                            <span className="text-gray-900">{log.quantity_used}</span>
                          </div>
                        )}
                        {log.weather_condition && (
                          <div>
                            <span className="text-gray-600">Thời tiết: </span>
                            <span className="text-gray-900">{log.weather_condition}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có nhật ký nào</h2>
                <p className="text-gray-600">
                  Ghi chép lại các hoạt động canh tác hàng ngày
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
