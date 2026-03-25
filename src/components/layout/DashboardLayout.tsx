'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Home, PlaySquare, TrendingUp, Settings, LogOut, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, error } = useTelegramAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('fitness_token');
        router.push('/');
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7] text-red-500 p-4 text-center font-sans">
                Ошибка: {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
            </div>
        );
    }

    const navItems = [
        { name: 'Главная', href: '/dashboard', icon: Home },
        { name: 'Программы', href: '/dashboard/programs', icon: PlaySquare },
        { name: 'Прогресс', href: '/dashboard/progress', icon: TrendingUp },
        { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
    ];

    if (user?.role === 'admin') {
        const { Shield } = require('lucide-react');
        navItems.push({ name: 'Доступ', href: '/admin', icon: Shield });
    }

    return (
        <div className="flex h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-rose-200">
            {/* Sidebar for desktop */}
            <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white md:flex">
                <div className="flex h-20 items-center px-6">
                    <span className="text-xl font-serif tracking-tight font-medium">
                        <span className="text-stone-900">Lola</span>
                        <span className="text-rose-400 italic">Fitness</span>
                    </span>
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all group',
                                    isActive
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-rose-500" : "text-stone-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto border-t border-stone-100 p-6 bg-stone-50/50 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-medium border border-rose-200">
                            {user?.name?.[0]?.toUpperCase() || 'L'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-stone-900 truncate max-w-[120px]">{user?.name || 'Гость'}</span>
                            <span className="text-xs text-stone-500">Базовый доступ</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium mt-2"
                    >
                        <LogOut className="h-4 w-4" /> Выйти
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="min-h-full p-4 pb-32 md:p-8 md:max-w-5xl md:mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 border-t border-stone-200 bg-white/90 backdrop-blur-lg pb-safe md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                                isActive ? 'text-rose-500' : 'text-stone-400 hover:text-stone-600'
                            )}
                        >
                            <div className={cn(
                                "flex h-8 w-16 items-center justify-center rounded-full transition-all mb-0.5",
                                isActive ? "bg-rose-100" : "bg-transparent"
                            )}>
                                <Icon className={cn("h-5 w-5", isActive ? "text-rose-600" : "")} />
                            </div>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
