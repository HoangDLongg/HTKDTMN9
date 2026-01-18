/**
 * HTX Crop Documents Page
 * Quản lý tài liệu kỹ thuật cây trồng
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PageHeader from '@/components/PageHeader';
import { FileText, Download, Eye, Upload, Search, Filter, BookOpen, Video, FileCheck } from 'lucide-react';

interface CropDocument {
    id: number;
    title: string;
    document_type: string;
    description: string;
    file_url: string;
    file_name: string;
    external_link: string;
    crop_name: string;
    author: string;
    source: string;
    publish_date: string;
    view_count: number;
    download_count: number;
    uploaded_by_name: string;
    created_at: string;
}

export default function HTXDocumentsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [documents, setDocuments] = useState<CropDocument[]>([]);
    const [filteredDocs, setFilteredDocs] = useState<CropDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    const documentTypes = [
        { value: 'all', label: 'Tất cả', icon: FileText },
        { value: 'guide', label: 'Hướng dẫn kỹ thuật', icon: BookOpen },
        { value: 'manual', label: 'Sổ tay canh tác', icon: FileCheck },
        { value: 'video', label: 'Video hướng dẫn', icon: Video },
        { value: 'research', label: 'Nghiên cứu khoa học', icon: FileText },
        { value: 'regulation', label: 'Quy định/Tiêu chuẩn', icon: FileCheck },
    ];

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadDocuments();
        }
    }, [user, authLoading]);

    useEffect(() => {
        filterDocuments();
    }, [documents, searchTerm, selectedType]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://127.0.0.1:8000/api/crop-documents/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setDocuments(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterDocuments = () => {
        let filtered = documents;

        if (selectedType !== 'all') {
            filtered = filtered.filter(doc => doc.document_type === selectedType);
        }

        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDocs(filtered);
    };

    const trackView = async (docId: number) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://127.0.0.1:8000/api/crop-documents/${docId}/track_view/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to track view:', error);
        }
    };

    const trackDownload = async (docId: number) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://127.0.0.1:8000/api/crop-documents/${docId}/track_download/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to track download:', error);
        }
    };

    const handleView = (doc: CropDocument) => {
        trackView(doc.id);
        if (doc.external_link) {
            window.open(doc.external_link, '_blank');
        } else if (doc.file_url) {
            window.open(doc.file_url, '_blank');
        }
    };

    const handleDownload = (doc: CropDocument) => {
        trackDownload(doc.id);
        if (doc.file_url) {
            window.open(doc.file_url, '_blank');
        }
    };

    const getTypeIcon = (type: string) => {
        const typeObj = documentTypes.find(t => t.value === type);
        const Icon = typeObj?.icon || FileText;
        return <Icon className="w-5 h-5" />;
    };

    const getTypeLabel = (type: string) => {
        return documentTypes.find(t => t.value === type)?.label || type;
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
                title="📚 Tài liệu kỹ thuật"
                subtitle="Thư viện tài liệu cây trồng cho nông dân"
            />

            <main className="container mx-auto px-4 py-8">
                {/* Search & Filter */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tài liệu, cây trồng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto">
                            {documentTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedType(type.value)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                                            selectedType === type.value
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{filteredDocs.length} tài liệu</span>
                        </div>
                    </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeIcon(doc.document_type)}
                                            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                                                {getTypeLabel(doc.document_type)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg line-clamp-2">{doc.title}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                {doc.crop_name && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                            {doc.crop_name}
                                        </span>
                                    </div>
                                )}

                                {doc.description && (
                                    <p className="text-sm text-gray-600 line-clamp-3">{doc.description}</p>
                                )}

                                {doc.author && (
                                    <div className="text-xs text-gray-500">
                                        Tác giả: {doc.author}
                                    </div>
                                )}

                                {doc.source && (
                                    <div className="text-xs text-gray-500">
                                        Nguồn: {doc.source}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {doc.view_count}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            {doc.download_count}
                                        </div>
                                    </div>
                                    <div>
                                        {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 border-t flex gap-2">
                                <button
                                    onClick={() => handleView(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <Eye className="w-4 h-4" />
                                    Xem
                                </button>
                                {doc.file_url && (
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDocs.length === 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">📚</div>
                        <p className="text-gray-500">Không tìm thấy tài liệu nào</p>
                    </div>
                )}
            </main>
        </div>
    );
}
