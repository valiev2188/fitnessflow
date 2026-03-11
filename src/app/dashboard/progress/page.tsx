'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Flame, Target, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const RANKS = [
    { min: 0, max: 4, label: 'Начинающая', icon: '🌱', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', perk: 'Доступ к демо-курсу' },
    { min: 5, max: 10, label: 'Активная', icon: '⚡', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', perk: 'Значок Активной' },
    { min: 11, max: 20, label: 'Старательная', icon: '🔥', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', perk: 'Скидка 10% на следующий курс' },
    { min: 21, max: 35, label: 'Чемпионка', icon: '🏆', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', perk: 'Именной сертификат' },
    { min: 36, max: 999, label: 'Элита', icon: '💎', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', perk: 'Личное сообщение от Лолы' },
];

function getRank(count: number) {
    return RANKS.find(r => count >= r.min && count <= r.max) || RANKS[0];
}

function getNextRank(count: number) {
    const idx = RANKS.findIndex(r => count >= r.min && count <= r.max);
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export default function ProgressPage() {
    const { token, loading: authLoading } = useTelegramAuth();
    const [progress, setProgress] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProgress() {
            try {
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
                const progRes = await fetch('/api/progress', { headers });
                const progData = await progRes.json();
                if (progData.progress) {
                    setProgress(progData.progress.filter((p: any) => p.completed));
                }
            } catch (err) {
                console.error('Failed to fetch progress', err);
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading) fetchProgress();
    }, [token, authLoading]);

    const totalCompleted = progress.length;

    const completedDates = new Set(progress.map(p => {
        const d = new Date(p.completedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (completedDates.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) streak++;
        else if (i > 0) break;
    }

    const currentRank = getRank(totalCompleted);
    const nextRank = getNextRank(totalCompleted);
    const progressToNext = nextRank ? ((totalCompleted - currentRank.min) / (nextRank.min - currentRank.min)) * 100 : 100;

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 tracking-tight mb-1">Ваши Достижения</h1>
                    <p className="text-stone-500 font-light text-sm">Каждая тренировка — шаг к лучшей версии себя.</p>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
                    </div>
                ) : (
                    <>
                        {/* Current Rank Card */}
                        <div className={`rounded-3xl border-2 ${currentRank.border} ${currentRank.bg} p-6`}>
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">{currentRank.icon}</div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-1">Текущий ранг</p>
                                    <h2 className={`text-2xl font-bold ${currentRank.color}`}>{currentRank.label}</h2>
                                    <p className="text-sm text-stone-500 font-light mt-0.5">🎁 {currentRank.perk}</p>
                                </div>
                            </div>
                            {nextRank && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                                        <span>До ранга «{nextRank.label} {nextRank.icon}»</span>
                                        <span><b>{totalCompleted}</b> / {nextRank.min} тренировок</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                                        <div className="h-full rounded-full bg-rose-400 transition-all duration-700" style={{ width: `${Math.min(progressToNext, 100)}%` }} />
                                    </div>
                                </div>
                            )}
                            {!nextRank && <p className="mt-3 text-center text-sm font-semibold text-purple-600">💎 Вы достигли максимального ранга!</p>}
                        </div>

                        {/* All Ranks */}
                        <div className="bg-white rounded-3xl border border-stone-100 p-6">
                            <h2 className="text-base font-semibold text-stone-900 mb-4">Все Ранги</h2>
                            <div className="space-y-3">
                                {RANKS.map((rank) => {
                                    const isUnlocked = totalCompleted >= rank.min;
                                    const isCurrent = rank.label === currentRank.label;
                                    return (
                                        <div key={rank.label} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isCurrent ? `${rank.bg} border ${rank.border}` : isUnlocked ? 'bg-stone-50' : 'opacity-40'}`}>
                                            <span className="text-2xl">{rank.icon}</span>
                                            <div className="flex-1">
                                                <p className={`font-semibold text-sm ${isCurrent ? rank.color : 'text-stone-700'}`}>
                                                    {rank.label}
                                                    {isCurrent && <span className="ml-2 text-xs bg-rose-400 text-white px-2 py-0.5 rounded-full">Вы здесь</span>}
                                                </p>
                                                <p className="text-xs text-stone-400">{rank.min}–{rank.max === 999 ? '∞' : rank.max} трен. · {rank.perk}</p>
                                            </div>
                                            {isUnlocked && <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-stone-100 bg-white p-4 flex flex-col items-center text-center">
                                <Target className="h-5 w-5 text-rose-400 mb-2" />
                                <div className="text-2xl font-bold text-stone-900">{totalCompleted}</div>
                                <div className="text-[10px] font-medium text-stone-400 uppercase">Сделано</div>
                            </div>
                            <div className="rounded-2xl border border-stone-100 bg-white p-4 flex flex-col items-center text-center">
                                <Flame className="h-5 w-5 text-orange-400 mb-2" />
                                <div className="text-2xl font-bold text-stone-900">{streak}</div>
                                <div className="text-[10px] font-medium text-stone-400 uppercase">Серия</div>
                            </div>
                            <div className="rounded-2xl border border-stone-100 bg-white p-4 flex flex-col items-center text-center">
                                <Trophy className="h-5 w-5 text-yellow-400 mb-2" />
                                <div className="text-2xl font-bold text-stone-900">{completedDates.size}</div>
                                <div className="text-[10px] font-medium text-stone-400 uppercase">Дней</div>
                            </div>
                        </div>

                        {/* History */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-100">
                            <h2 className="text-base font-semibold text-stone-900 mb-4">История Тренировок</h2>
                            {progress.length === 0 ? (
                                <div className="text-center p-8 border border-dashed border-stone-200 rounded-2xl text-stone-400 bg-stone-50">
                                    <p className="mb-4 font-light">Пока нет завершённых тренировок.</p>
                                    <Link href="/dashboard/programs" className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-500 transition-all">Выбрать Курс</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {progress.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 8).map((p) => (
                                        <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-all">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-stone-900 text-sm">Тренировка #{p.workoutId}</p>
                                                <p className="text-xs text-stone-400 mt-0.5">{new Date(p.completedAt).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
