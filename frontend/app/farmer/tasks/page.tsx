/**
 * Farmer Tasks Page
 * Danh sách công việc hàng ngày theo vụ mùa
 * Enhanced version with improved UI and features
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { 
    CheckCircle, 
    Circle, 
    Calendar, 
    Clock, 
    AlertCircle, 
    Leaf,
    ChevronDown,
    ChevronUp,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';

interface DailyTask {
    id: number;
    season: number;
    season_code?: string;
    crop_name?: string;
    task_name: string;
    description: string;
    due_date: string;
    is_completed: boolean;
    completed_at: string | null;
    completed_by: number | null;
    notes?: string;
}

interface Season {
    id: number;
    season_code: string;
    crop: {
        id: number;
        name: string;
    };
    farm: {
        id: number;
        name: string;
    };
    status: string;
}

export default function FarmerTasksPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'today'>('all');
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadSeasons();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (selectedSeasonId) {
            loadTasks(selectedSeasonId);
        }
    }, [selectedSeasonId]);

    const loadSeasons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://127.0.0.1:8000/api/seasons/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            const seasonsArray = Array.isArray(data) ? data : data.results || [];
            
            // Filter active seasons (not completed)
            const activeSeasons = seasonsArray.filter((s: Season) => s.status !== 'completed');
            setSeasons(activeSeasons);
            
            // Auto-select first season
            if (activeSeasons.length > 0) {
                setSelectedSeasonId(activeSeasons[0].id);
            }
        } catch (error) {
            console.error('Failed to load seasons:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async (seasonId: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/seasons/${seasonId}/daily_tasks/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            const tasksArray = Array.isArray(data) ? data : data.results || [];
            
            // Enrich with season data
            const season = seasons.find(s => s.id === seasonId);
            const enrichedTasks = tasksArray.map((task: DailyTask) => ({
                ...task,
                season_code: season?.season_code,
                crop_name: season?.crop?.name
            }));
            
            setTasks(enrichedTasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId: number) => {
        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch(`http://127.0.0.1:8000/api/daily-tasks/${taskId}/complete/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed_by_id: user?.id
                })
            });

            if (!response.ok) throw new Error('Failed to complete task');

            // Reload tasks
            if (selectedSeasonId) {
                loadTasks(selectedSeasonId);
            }
        } catch (error) {
            console.error('Complete task error:', error);
            alert('Lỗi khi hoàn thành công việc');
        }
    };

    const handleRefresh = async () => {
        if (selectedSeasonId) {
            setRefreshing(true);
            await loadTasks(selectedSeasonId);
            setRefreshing(false);
        }
    };

    const toggleTaskExpand = (taskId: number) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    };

    const getFilteredTasks = () => {
        const today = new Date().toISOString().split('T')[0];
        
        switch (filter) {
            case 'today':
                return tasks.filter(t => t.due_date === today);
            case 'pending':
                return tasks.filter(t => !t.is_completed);
            case 'completed':
                return tasks.filter(t => t.is_completed);
            case 'overdue':
                return tasks.filter(t => !t.is_completed && t.due_date < today);
            default:
                return tasks;
        }
    };

    const filteredTasks = getFilteredTasks();

    const getTaskStatus = (task: DailyTask) => {
        const today = new Date().toISOString().split('T')[0];
        
        if (task.is_completed) {
            return { label: 'Hoàn thành', color: 'green', icon: CheckCircle };
        } else if (task.due_date < today) {
            return { label: 'Quá hạn', color: 'red', icon: AlertCircle };
        } else if (task.due_date === today) {
            return { label: 'Hôm nay', color: 'orange', icon: Clock };
        } else {
            return { label: 'Đang chờ', color: 'blue', icon: Circle };
        }
    };

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.is_completed).length,
        pending: tasks.filter(t => !t.is_completed).length,
        overdue: tasks.filter(t => !t.is_completed && t.due_date < new Date().toISOString().split('T')[0]).length,
        today: tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]).length
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="✅ Công việc hàng ngày"
                subtitle="Theo dõi và hoàn thành công việc canh tác"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Season Selector & Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn vụ mùa
                            </label>
                            <select
                                value={selectedSeasonId || ''}
                                onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
                                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">-- Chọn vụ mùa --</option>
                                {seasons.map(season => (
                                    <option key={season.id} value={season.id}>
                                        {season.season_code} - {season.crop?.name} ({season.farm?.name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedSeasonId && (
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>
                        )}
                    </div>

                    {selectedSeasonId && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                <div className="text-xs text-blue-800">Tổng số</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-orange-600">{stats.today}</div>
                                <div className="text-xs text-orange-800">Hôm nay</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                                <div className="text-xs text-green-800">Hoàn thành</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                                <div className="text-xs text-yellow-800">Đang chờ</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                                <div className="text-xs text-red-800">Quá hạn</div>
                            </div>
                        </div>
                    )}

                    {/* Filter Buttons */}
                    {selectedSeasonId && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Lọc công việc:</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                                        filter === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tất cả ({stats.total})
                                </button>
                                <button
                                    onClick={() => setFilter('today')}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                                        filter === 'today' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    🔥 Hôm nay ({stats.today})
                                </button>
                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                                        filter === 'pending' ? 'bg-yellow-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Đang chờ ({stats.pending})
                                </button>
                                <button
                                    onClick={() => setFilter('completed')}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                                        filter === 'completed' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    ✅ Hoàn thành ({stats.completed})
                                </button>
                                <button
                                    onClick={() => setFilter('overdue')}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                                        filter === 'overdue' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    ⚠️ Quá hạn ({stats.overdue})
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tasks List */}
                {selectedSeasonId && (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => {
                            const status = getTaskStatus(task);
                            const StatusIcon = status.icon;
                            const isExpanded = expandedTasks.has(task.id);
                            
                            return (
                                <div key={task.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Checkbox */}
                                            <button
                                                onClick={() => !task.is_completed && handleCompleteTask(task.id)}
                                                disabled={task.is_completed}
                                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${
                                                    task.is_completed
                                                        ? 'bg-green-100 text-green-600 cursor-default'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 cursor-pointer'
                                                }`}
                                            >
                                                <StatusIcon className="w-6 h-6" />
                                            </button>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className={`text-lg font-bold ${
                                                        task.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
                                                    }`}>
                                                        {task.task_name}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-${status.color}-100 text-${status.color}-800`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Quick Info */}
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    {task.is_completed && task.completed_at && (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Hoàn thành: {new Date(task.completed_at).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Description (Always visible if exists, or expandable) */}
                                                {task.description && (
                                                    <div>
                                                        <p className={`text-sm ${
                                                            task.is_completed ? 'text-gray-400' : 'text-gray-600'
                                                        } ${!isExpanded && task.description.length > 150 ? 'line-clamp-2' : ''}`}>
                                                            {task.description}
                                                        </p>
                                                        
                                                        {/* Expand/Collapse Button */}
                                                        {task.description.length > 150 && (
                                                            <button
                                                                onClick={() => toggleTaskExpand(task.id)}
                                                                className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <ChevronUp className="w-4 h-4" />
                                                                        Thu gọn
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="w-4 h-4" />
                                                                        Xem thêm
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Notes (if expanded) */}
                                                {isExpanded && task.notes && (
                                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                        <p className="text-sm text-gray-700">
                                                            <strong className="text-yellow-800">Ghi chú:</strong> {task.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredTasks.length === 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="text-gray-400 text-5xl mb-4">
                                    {filter === 'today' && '📅'}
                                    {filter === 'completed' && '✅'}
                                    {filter === 'pending' && '⏳'}
                                    {filter === 'overdue' && '⚠️'}
                                    {filter === 'all' && '🌱'}
                                </div>
                                <p className="text-gray-500 text-lg font-medium">
                                    {filter === 'today' && 'Không có công việc nào hôm nay'}
                                    {filter === 'completed' && 'Chưa hoàn thành công việc nào'}
                                    {filter === 'pending' && 'Tất cả công việc đã hoàn thành!'}
                                    {filter === 'overdue' && 'Không có công việc quá hạn'}
                                    {filter === 'all' && 'Không có công việc nào'}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Chọn bộ lọc khác để xem công việc
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!selectedSeasonId && seasons.length === 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">🌱</div>
                        <p className="text-gray-500">Chưa có vụ mùa nào đang hoạt động</p>
                    </div>
                )}
            </main>
        </div>
    );
}
