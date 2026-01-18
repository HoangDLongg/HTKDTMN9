'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';

const NotificationBell = dynamic(() => import('@/components/NotificationBell'), { ssr: false });

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backLink?: string;
    backText?: string;
}

export default function PageHeader({ title, subtitle, backLink = '/dashboard', backText = '← Về Dashboard' }: PageHeaderProps) {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell - Chỉ hiện khi đã login */}
                        {user && <NotificationBell />}

                        {/* Back Button */}
                        <Link
                            href={backLink}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            {backText}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
