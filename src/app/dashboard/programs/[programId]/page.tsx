'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChevronLeft, PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/layout/DashboardLayout';

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

                // Fetch program and workouts
                const progRes = await fetch(`/api/programs/${params.programId}`, { headers });
                const progData = await progRes.json();

                if (progData.program) {
                    setProgram(progData.program);
                    setWorkouts(progData.workouts || []);
                }

                // Fetch user progress
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

        if (!authLoading) {
            fetchData();
        }
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

    // Calculate completion percentage
    const completedWorkoutIds = new Set(progress.filter(p => p.completed).map(p => p.workoutId));
    const completionPercentage = workouts.length > 0
        ? Math.round((completedWorkoutIds.size / workouts.length) * 100)
        : 0;

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="group flex w-fit items-center gap-2 text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Назад
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">{program.title}</h1>
                            <p className="mt-2 text-stone-500 font-light max-w-2xl">{program.description}</p>
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col items-end min-w-[120px]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-stone-900">{completionPercentage}%</span>
                                <span className="text-xs text-stone-400 uppercase tracking-widest">Пройдено</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                                <div
                                    className="h-full bg-rose-400 transition-all duration-700 ease-out"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workouts List */}
                <div className="pt-4">
                    <h2 className="text-xl font-medium text-stone-900 mb-6 border-b border-stone-100 pb-4">Расписание</h2>

                    <div className="flex flex-col space-y-3">
                        {workouts.sort((a, b) => a.dayNumber - b.dayNumber).map((workout) => {
                            const isCompleted = completedWorkoutIds.has(workout.id);

                            return (
                                <Link
                                    key={workout.id}
                                    href={`/dashboard/workouts/${workout.id}`}
                                    className={cn(
                                        "group flex items-center justify-between p-5 rounded-2xl border transition-all shadow-sm",
                                        isCompleted
                                            ? "border-rose-100 bg-rose-50/50 hover:bg-rose-50"
                                            : "border-stone-100 bg-white hover:border-rose-200 hover:shadow-md hover:shadow-rose-900/5"
                                    )}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-medium text-lg border",
                                            isCompleted
                                                ? "bg-rose-100 border-rose-200 text-rose-600"
                                                : "bg-stone-50 border-stone-100 text-stone-500"
                                        )}>
                                            {workout.dayNumber}
                                        </div>
                                        <div>
                                            <h3 className={cn("font-medium transition-colors", isCompleted ? "text-rose-900" : "text-stone-900 group-hover:text-rose-600")}>
                                                {workout.title}
                                            </h3>
                                            <p className="text-sm text-stone-500 font-light line-clamp-1 max-w-[200px] md:max-w-md mt-0.5">
                                                {workout.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pl-4 shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-6 w-6 text-rose-400" />
                                        ) : (
                                            <PlayCircle className="h-6 w-6 text-stone-300 group-hover:text-rose-400 transition-colors" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}

                        {workouts.length === 0 && (
                            <div className="text-center p-8 border border-dashed border-stone-200 rounded-2xl text-stone-400 bg-stone-50">
                                Тренировки еще не добавлены в этот курс.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
