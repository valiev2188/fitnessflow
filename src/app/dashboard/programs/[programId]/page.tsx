'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout, cn } from '@/components/layout/DashboardLayout';
import { ChevronLeft, PlayCircle, CheckCircle2, Clock, Dumbbell, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProgramPage() {
    const params = useParams();
    const router = useRouter();
    const { token, loading: authLoading } = useTelegramAuth();

    const [program, setProgram] = useState<any>(null);
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (!params.programId) return;
            try {
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
                const progRes = await fetch(`/api/programs/${params.programId}`, { headers });
                const progData = await progRes.json();
                if (progData.program) {
                    setProgram(progData.program);
                    setWorkouts(progData.workouts || []);
                }
                const progTrackRes = await fetch('/api/progress', { headers });
                if (progTrackRes.ok) {
                    const progressData = await progTrackRes.json();
                    setProgress(progressData.progress || []);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading) fetchData();
    }, [params.programId, token, authLoading]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
                </div>
            </DashboardLayout>
        );
    }

    if (!program) {
        return (
            <DashboardLayout>
                <div className="text-center p-8 text-stone-400">Курс не найден.</div>
            </DashboardLayout>
        );
    }

    const completedWorkoutIds = new Set(progress.filter(p => p.completed).map(p => p.workoutId));
    const completionPercentage = workouts.length > 0 ? Math.round((completedWorkoutIds.size / workouts.length) * 100) : 0;
    const sortedWorkouts = workouts.sort((a, b) => a.dayNumber - b.dayNumber);

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="group flex w-fit items-center gap-2 text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Назад
                </button>

                {/* Hero Header Area */}
                <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 text-white shadow-xl shadow-stone-900/10 p-8 md:p-12">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-rose-500 blur-[80px] opacity-30 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md border border-white/10">
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                    <Star className="w-3.5 h-3.5 text-white/30" />
                                    <span className="ml-1">Средний</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md border border-white/10">
                                    <Clock className="w-3.5 h-3.5" />
                                    {workouts.length} дней
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md border border-white/10">
                                    <Dumbbell className="w-3.5 h-3.5" />
                                    Дома
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-serif tracking-tight mb-3">{program.title}</h1>
                            <p className="text-white/70 font-light max-w-xl text-sm md:text-base">{program.description}</p>
                        </div>

                        {/* Progress */}
                        <div className="md:w-48 shrink-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <span className="text-xs text-white/60 uppercase tracking-widest font-medium">Пройдено</span>
                                <span className="text-sm font-bold">{completionPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                                <div
                                    className="h-full bg-rose-400 transition-all duration-700 ease-out"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <div className="text-right mt-1">
                                <span className="text-[10px] text-white/40">{completedWorkoutIds.size} из {workouts.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workouts List Header */}
                <div className="flex items-center justify-between px-2 pt-4 border-b border-stone-100 pb-4">
                    <h2 className="text-2xl font-serif text-stone-900">
                        Программа курса включает <span className="text-rose-400">{workouts.length}</span> тренировок:
                    </h2>
                </div>

                {/* Workouts List */}
                <div className="flex flex-col space-y-3">
                    {sortedWorkouts.map((workout, index) => {
                        const isCompleted = completedWorkoutIds.has(workout.id);
                        return (
                            <Link
                                key={workout.id}
                                href={`/dashboard/workouts/${workout.id}`}
                                className={cn(
                                    "group flex items-center justify-between p-4 md:p-5 rounded-[2rem] border transition-all shadow-sm",
                                    isCompleted
                                        ? "border-rose-100 bg-rose-50/50 hover:bg-rose-50"
                                        : "border-stone-100 bg-white hover:border-rose-200 hover:shadow-md hover:shadow-rose-900/5"
                                )}
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={cn(
                                        "flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-2xl font-serif text-lg md:text-xl transition-colors border",
                                        isCompleted
                                            ? "bg-rose-100 border-rose-200 text-rose-600"
                                            : "bg-stone-50 border-stone-100 text-stone-500 group-hover:bg-rose-50 group-hover:text-rose-400 group-hover:border-rose-100"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className={cn("text-base md:text-lg font-medium transition-colors line-clamp-1", isCompleted ? "text-rose-900" : "text-stone-900 group-hover:text-rose-600")}>
                                            {workout.title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-stone-500 font-light line-clamp-1 max-w-[200px] md:max-w-md mt-0.5">
                                            {workout.description || "Тренировка на всё тело"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pl-4 shrink-0 transition-transform group-hover:translate-x-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6 text-rose-400" />
                                    ) : (
                                        <div className="flex items-center gap-2 text-stone-300 group-hover:text-rose-400 transition-colors">
                                            <span className="text-xs font-medium uppercase tracking-widest hidden md:block">Начать</span>
                                            <PlayCircle className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    {workouts.length === 0 && (
                        <div className="text-center p-12 border border-dashed border-stone-200 rounded-3xl text-stone-400 bg-stone-50">
                            Тренировки еще не добавлены в этот курс.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
