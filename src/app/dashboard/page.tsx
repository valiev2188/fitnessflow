'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Flame, Target, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// -- Activity Calendar Component --
function ActivityCalendar({ completedDates }: { completedDates: Set<string> }) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthName = today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust Sunday (0) to be last (6)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return (
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-stone-900 capitalize">{monthName}</h2>
                <span className="text-xs font-medium text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                    Активность
                </span>
            </div>
            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-stone-400 uppercase">{d}</div>
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = day === today.getDate();
                    const isDone = completedDates.has(dateStr);
                    const isPast = day < today.getDate();
                    return (
                        <div
                            key={day}
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                                ${isDone ? 'bg-rose-400 text-white shadow-sm shadow-rose-400/50' : ''}
                                ${isToday && !isDone ? 'border-2 border-rose-400 text-rose-500' : ''}
                                ${!isDone && !isToday ? 'text-stone-400 hover:bg-stone-50' : ''}
                            `}
                        >
                            {isDone ? '✓' : day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, token, loading: authLoading, startParam } = useTelegramAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [progress, setProgress] = useState<any[]>([]);

    // Deep-link: if bot opened with startapp=programs, go straight to programs
    useEffect(() => {
        if (startParam === 'programs') {
            router.replace('/dashboard/programs');
        }
    }, [startParam]);

    useEffect(() => {
        if (authLoading || !token) return;
        async function fetchAll() {
            const headers = { Authorization: `Bearer ${token}` };

            // Check onboarding
            const profileRes = await fetch('/api/profile', { headers });
            const profileData = await profileRes.json();
            setProfile(profileData.profile);
            if (!profileData.profile?.onboardingCompleted) {
                router.replace('/onboarding');
                return;
            }

            // Fetch progress for calendar
            const progRes = await fetch('/api/progress', { headers });
            const progData = await progRes.json();
            setProgress((progData.progress || []).filter((p: any) => p.completed && p.completedAt));

            setLoading(false);
        }
        fetchAll();
    }, [authLoading, token]);

    // Compute stats
    const completedDates = new Set(
        progress.map(p => {
            const d = new Date(p.completedAt);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
    );

    // Streak calculation
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (completedDates.has(str)) streak++;
        else if (i > 0) break;
    }

    const goalLabels: Record<string, string> = {
        lose_weight: '🔥 Похудеть',
        tone: '✨ Подтянуть тело',
        gain_muscle: '💪 Набрать мышцы',
        health: '🌿 Здоровье',
    };

    if (loading || authLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-6 max-w-2xl mx-auto">

                {/* Welcome card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white shadow-lg shadow-rose-500/30">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -right-2 bottom-4 h-16 w-16 rounded-full bg-white/10" />
                    <p className="text-sm font-medium text-rose-100 mb-1">Привет! 👋</p>
                    <h1 className="text-2xl font-serif font-semibold">{user?.name || 'Спортсменка'}</h1>
                    {profile?.goal && (
                        <p className="text-rose-100 text-sm mt-1 font-light">Цель: {goalLabels[profile.goal] || profile.goal}</p>
                    )}
                    <div className="mt-4">
                        <Link href="/dashboard/programs">
                            <button className="flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white border border-white/30 hover:bg-white/30 transition-all active:scale-95">
                                Начать тренировку <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-stone-100 bg-white p-4 flex flex-col items-center text-center shadow-sm">
                        <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-2">
                            <Flame className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{streak}</div>
                        <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mt-0.5">Серия</div>
                    </div>
                    <div className="rounded-2xl border border-stone-100 bg-white p-4 flex flex-col items-center text-center shadow-sm">
                        <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                            <Target className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{progress.length}</div>
                        <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mt-0.5">Сделано</div>
                    </div>
                    <div className="rounded-2xl border border-stone-100 bg-white p-4 flex flex-col items-center text-center shadow-sm">
                        <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-2">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{completedDates.size}</div>
                        <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mt-0.5">Дней</div>
                    </div>
                </div>

                {/* Activity Calendar */}
                <ActivityCalendar completedDates={completedDates} />

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/programs">
                        <div className="rounded-2xl border border-stone-100 bg-white p-5 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer">
                            <div className="text-2xl mb-2">🏋️</div>
                            <h3 className="font-semibold text-stone-900 text-sm">Мои Курсы</h3>
                            <p className="text-xs text-stone-400 font-light mt-0.5">Продолжить программу</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/progress">
                        <div className="rounded-2xl border border-stone-100 bg-white p-5 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer">
                            <div className="text-2xl mb-2">📊</div>
                            <h3 className="font-semibold text-stone-900 text-sm">Прогресс</h3>
                            <p className="text-xs text-stone-400 font-light mt-0.5">Моя история побед</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/settings">
                        <div className="rounded-2xl border border-stone-100 bg-white p-5 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer">
                            <div className="text-2xl mb-2">⚙️</div>
                            <h3 className="font-semibold text-stone-900 text-sm">Профиль</h3>
                            <p className="text-xs text-stone-400 font-light mt-0.5">Цели и настройки</p>
                        </div>
                    </Link>
                    <a href="https://t.me/vvveins" target="_blank" rel="noopener noreferrer">
                        <div className="rounded-2xl border border-stone-100 bg-white p-5 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer">
                            <div className="text-2xl mb-2">💬</div>
                            <h3 className="font-semibold text-stone-900 text-sm">Тренер</h3>
                            <p className="text-xs text-stone-400 font-light mt-0.5">Написать Лоле</p>
                        </div>
                    </a>
                </div>

            </div>
        </DashboardLayout>
    );
}
