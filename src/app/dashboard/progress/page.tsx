'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Flame, Target, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/layout/DashboardLayout';

export default function ProgressPage() {
    const { token, loading: authLoading } = useTelegramAuth();

    const [progress, setProgress] = useState<any[]>([]);
    const [workouts, setWorkouts] = useState<Record<number, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProgress() {
            try {
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

                // Fetch progress
                const progRes = await fetch('/api/progress', { headers });
                const progData = await progRes.json();

                if (progData.progress) {
                    const completedProgress = progData.progress.filter((p: any) => p.completed);
                    setProgress(completedProgress);
                }
            } catch (err) {
                console.error('Failed to fetch progress', err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            fetchProgress();
        }
    }, [token, authLoading]);

    // Derived stats
    const totalCompleted = progress.length;
    // Calculate streak (simplified: just counting unique days they worked out)
    const uniqueDates = new Set(progress.map(p => new Date(p.completedAt).toDateString()));
    const streak = uniqueDates.size;

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 tracking-tight mb-2">Ваши Достижения</h1>
                    <p className="text-stone-500 font-light">Регулярность — ключ к успеху. Здесь сохраняется каждая ваша победа.</p>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
                    </div>
                ) : (
                    <div className="flex flex-col space-y-10">
                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-sm shadow-rose-900/5">
                                <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mb-5">
                                    <Target className="h-7 w-7" />
                                </div>
                                <div className="text-4xl font-semibold text-stone-900 mb-1">{totalCompleted}</div>
                                <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mt-1">Тренировок</div>
                            </div>

                            <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-sm shadow-rose-900/5">
                                <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center mb-5">
                                    <Flame className="h-7 w-7" />
                                </div>
                                <div className="text-4xl font-semibold text-stone-900 mb-1">{streak}</div>
                                <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mt-1">Дней Серия</div>
                            </div>

                            <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-sm shadow-rose-900/5">
                                <div className="h-14 w-14 rounded-2xl bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center mb-5">
                                    <Trophy className="h-7 w-7" />
                                </div>
                                <div className="text-3xl font-semibold text-stone-900 mb-2">Элита</div>
                                <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mt-1">Текущий Ранг</div>
                            </div>
                        </div>

                        {/* History Feed */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-100 shadow-sm shadow-rose-900/5">
                            <h2 className="text-xl font-medium text-stone-900 mb-6 border-b border-stone-100 pb-4">Недавняя Активность</h2>

                            {progress.length === 0 ? (
                                <div className="text-center p-10 border border-dashed border-stone-200 rounded-2xl text-stone-400 bg-stone-50">
                                    <p className="mb-6 font-light">Пока нет завершенных тренировок.</p>
                                    <Link
                                        href="/dashboard/programs"
                                        className="inline-flex rounded-full bg-stone-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-stone-800 transition-all hover:-translate-y-0.5"
                                    >
                                        Выбрать Курс
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-4">
                                    {progress
                                        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                                        .slice(0, 10)
                                        .map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center gap-5 p-5 rounded-2xl border border-stone-100 bg-[#FDFBF7] transition-all hover:bg-white hover:shadow-sm"
                                            >
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500 border border-rose-200">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-stone-900 truncate">
                                                        Выполнена тренировка #{p.workoutId}
                                                    </p>
                                                    <p className="text-sm font-light text-stone-500 truncate mt-0.5">
                                                        {new Date(p.completedAt).toLocaleString('ru-RU', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        })}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/dashboard/workouts/${p.workoutId}`}
                                                    className="rounded-full bg-stone-100 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-rose-100 hover:text-rose-600 transition-colors hidden sm:block"
                                                >
                                                    Посмотреть
                                                </Link>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
