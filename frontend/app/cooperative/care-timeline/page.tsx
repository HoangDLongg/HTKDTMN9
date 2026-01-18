/**
 * HTX Care Timeline Page
 * Lộ trình chăm sóc cây trồng chi tiết
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { Calendar, Leaf, ChevronDown, ChevronUp, Clock, FileText, Sprout, Droplets, Bug } from 'lucide-react';

interface StageTask {
    id: number;
    task_order: number;
    day_number: number;
    task_name: string;
    description: string;
    materials_needed: string;
    quantity_per_hectare: string;
    notes: string;
}

interface ProcessStage {
    id: number;
    stage_order: number;
    name: string;
    day_start: number;
    day_end: number;
    description: string;
    tasks: StageTask[];
}

interface TechnicalProcess {
    id: number;
    name: string;
    crop_id: number;
    crop_name: string;
    total_days: number;
    standard_type: string;
    description: string;
    is_active: boolean;
    stages: ProcessStage[];
}

export default function HTXCareTimelinePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [processes, setProcesses] = useState<TechnicalProcess[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<TechnicalProcess | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

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
            const token = localStorage.getItem('authToken');

            // Load processes with stages
            const processesRes = await fetch('http://127.0.0.1:8000/api/technical-processes/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const processesData = await processesRes.json();
            const processesArray = Array.isArray(processesData) ? processesData : processesData.results || [];

            // Load stages and tasks for each process
            const enrichedProcesses = await Promise.all(
                processesArray.map(async (proc: any) => {
                    // Get stages
                    const stagesRes = await fetch(`http://127.0.0.1:8000/api/process-stages/?process=${proc.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const stagesData = await stagesRes.json();
                    const stages = Array.isArray(stagesData) ? stagesData : stagesData.results || [];

                    // Get tasks for each stage
                    const stagesWithTasks = await Promise.all(
                        stages.map(async (stage: any) => {
                            const tasksRes = await fetch(`http://127.0.0.1:8000/api/stage-tasks/?stage=${stage.id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const tasksData = await tasksRes.json();
                            const tasks = Array.isArray(tasksData) ? tasksData : tasksData.results || [];
                            
                            return {
                                ...stage,
                                tasks: tasks.sort((a: StageTask, b: StageTask) => a.day_number - b.day_number)
                            };
                        })
                    );

                    return {
                        ...proc,
                        crop_name: proc.crop_name || 'N/A',
                        stages: stagesWithTasks.sort((a: ProcessStage, b: ProcessStage) => a.stage_order - b.stage_order)
                    };
                })
            );

            setProcesses(enrichedProcesses);
            
            // Auto-select first active process
            const firstActive = enrichedProcesses.find((p: TechnicalProcess) => p.is_active);
            if (firstActive) {
                setSelectedProcess(firstActive);
                // Auto-expand first stage
                if (firstActive.stages.length > 0) {
                    setExpandedStages(new Set([firstActive.stages[0].id]));
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStage = (stageId: number) => {
        const newExpanded = new Set(expandedStages);
        if (newExpanded.has(stageId)) {
            newExpanded.delete(stageId);
        } else {
            newExpanded.add(stageId);
        }
        setExpandedStages(newExpanded);
    };

    const getTaskIcon = (taskName: string) => {
        const name = taskName.toLowerCase();
        if (name.includes('tưới') || name.includes('nước')) return Droplets;
        if (name.includes('phun') || name.includes('thuốc') || name.includes('bệnh')) return Bug;
        if (name.includes('gieo') || name.includes('trồng')) return Sprout;
        return FileText;
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
                title="🌱 Lộ trình chăm sóc"
                subtitle="Quy trình kỹ thuật canh tác chi tiết"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Process Selector */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chọn quy trình kỹ thuật
                    </label>
                    <select
                        value={selectedProcess?.id || ''}
                        onChange={(e) => {
                            const proc = processes.find(p => p.id === parseInt(e.target.value));
                            setSelectedProcess(proc || null);
                            if (proc && proc.stages.length > 0) {
                                setExpandedStages(new Set([proc.stages[0].id]));
                            }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                    >
                        <option value="">-- Chọn quy trình --</option>
                        {processes.map(proc => (
                            <option key={proc.id} value={proc.id}>
                                {proc.name} - {proc.crop_name} ({proc.total_days} ngày)
                            </option>
                        ))}
                    </select>

                    {selectedProcess && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800 mb-1">
                                    <Leaf className="w-5 h-5" />
                                    <span className="font-semibold">Cây trồng</span>
                                </div>
                                <div className="text-2xl font-bold text-green-900">{selectedProcess.crop_name}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-800 mb-1">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-semibold">Thời gian</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-900">{selectedProcess.total_days} ngày</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-purple-800 mb-1">
                                    <FileText className="w-5 h-5" />
                                    <span className="font-semibold">Giai đoạn</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-900">{selectedProcess.stages.length}</div>
                            </div>
                        </div>
                    )}

                    {selectedProcess?.description && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{selectedProcess.description}</p>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                {selectedProcess && (
                    <div className="space-y-4">
                        {selectedProcess.stages.map((stage, stageIndex) => {
                            const isExpanded = expandedStages.has(stage.id);
                            const durationDays = stage.day_end - stage.day_start + 1;

                            return (
                                <div key={stage.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    {/* Stage Header */}
                                    <button
                                        onClick={() => toggleStage(stage.id)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                                                {stage.stage_order}
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-bold text-gray-900">{stage.name}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        Ngày {stage.day_start} - {stage.day_end} ({durationDays} ngày)
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="w-4 h-4" />
                                                        {stage.tasks.length} công việc
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-6 h-6 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-gray-400" />
                                        )}
                                    </button>

                                    {/* Stage Description */}
                                    {isExpanded && stage.description && (
                                        <div className="px-6 pb-4">
                                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                                <p className="text-sm text-gray-700">{stage.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tasks Timeline */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6">
                                            <div className="space-y-3">
                                                {stage.tasks.map((task, taskIndex) => {
                                                    const TaskIcon = getTaskIcon(task.task_name);
                                                    
                                                    return (
                                                        <div key={task.id} className="relative">
                                                            {/* Timeline connector */}
                                                            {taskIndex < stage.tasks.length - 1 && (
                                                                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-green-200"></div>
                                                            )}
                                                            
                                                            <div className="flex gap-4">
                                                                {/* Day badge */}
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-12 h-12 rounded-full bg-green-100 border-4 border-white shadow flex items-center justify-center">
                                                                        <span className="text-xs font-bold text-green-800">
                                                                            {task.day_number}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Task card */}
                                                                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                                    <div className="flex items-start gap-3">
                                                                        <TaskIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                                                        <div className="flex-1">
                                                                            <h4 className="font-bold text-gray-900 mb-1">
                                                                                {task.task_name}
                                                                            </h4>
                                                                            
                                                                            {task.description && (
                                                                                <p className="text-sm text-gray-600 mb-2">
                                                                                    {task.description}
                                                                                </p>
                                                                            )}

                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                                                {task.materials_needed && (
                                                                                    <div className="text-sm">
                                                                                        <span className="font-medium text-gray-700">Vật tư: </span>
                                                                                        <span className="text-gray-600">{task.materials_needed}</span>
                                                                                    </div>
                                                                                )}
                                                                                {task.quantity_per_hectare && (
                                                                                    <div className="text-sm">
                                                                                        <span className="font-medium text-gray-700">Liều lượng: </span>
                                                                                        <span className="text-gray-600">{task.quantity_per_hectare}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {task.notes && (
                                                                                <div className="mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                                                                                    <span className="text-xs font-medium text-yellow-800">
                                                                                        💡 Lưu ý: {task.notes}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!selectedProcess && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">🌱</div>
                        <p className="text-gray-500">Chọn quy trình để xem lộ trình chăm sóc</p>
                    </div>
                )}
            </main>
        </div>
    );
}
