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
        router.replace('/login');
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
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
        { name: 'Питание', href: '/dashboard/nutrition', icon: UtensilsCrossed },
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
            <aside className="hidden w-64 flex-col border-r border-stone-100/80 bg-white/80 backdrop-blur-xl md:flex">
                <div className="flex h-20 items-center px-6">
                    <span className="text-xl font-serif tracking-tight font-medium">
                        <span className="text-stone-900">Lola</span>
                        <span className="text-rose-400 italic">Fitness</span>
                    </span>
                </div>
                <nav className="flex flex-col gap-1 p-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group',
                                    isActive
                                        ? 'bg-stone-900 text-white shadow-sm'
                                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-stone-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto border-t border-stone-100 p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white text-sm font-medium">
                            {user?.name?.[0]?.toUpperCase() || 'L'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-stone-900 truncate max-w-[120px]">{user?.name || 'Гость'}</span>
                            <span className="text-xs text-stone-400">Базовый доступ</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors duration-200 text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" /> Выйти
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="min-h-full p-4 pb-28 md:p-8 md:max-w-5xl md:mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav — glass pill */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="mx-3 mb-3 flex h-16 items-center rounded-2xl bg-white/90 backdrop-blur-xl border border-stone-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.07),0_0_0_1px_rgba(255,255,255,0.5)_inset]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-90',
                                    isActive ? 'text-stone-900' : 'text-stone-400'
                                )}
                            >
                                <div className={cn(
                                    "flex h-8 w-12 items-center justify-center rounded-xl transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
                                    isActive ? "bg-stone-900" : "bg-transparent"
                                )}>
                                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-stone-400")} />
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="h-safe" />
            </nav>
        </div>
    );
}
