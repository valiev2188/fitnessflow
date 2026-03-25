'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChevronLeft, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

function getEmbedUrl(url: string) {
    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (match && match[1]) {
            embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&fs=1&playsinline=1&modestbranding=1`;
        }
    } else if (url.includes('vimeo.com')) {
        const match = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/);
        if (match && match[1]) {
            embedUrl = `https://player.vimeo.com/video/${match[1]}`;
        }
    }
    return embedUrl;
}

export default function WorkoutPage() {
    const params = useParams();
    const router = useRouter();
    const { token, loading: authLoading } = useTelegramAuth();

    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [allProgress, setAllProgress] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (!params.workoutId) return;

            try {
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

                // Fetch workout details
                const res = await fetch(`/api/workouts/${params.workoutId}`, { headers });
                const data = await res.json();

                if (data.workout) {
                    setWorkout(data.workout);
                }

                // Fetch user progress to see if completed
                const progRes = await fetch('/api/progress', { headers });
                if (progRes.ok) {
                    const progData = await progRes.json();
                    const isDone = progData.progress?.some((p: any) => p.workoutId === parseInt(params.workoutId as string, 10) && p.completed);
                    setCompleted(isDone);
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
    }, [params.workoutId, token, authLoading]);

    const handleToggleComplete = async () => {
        setMarkingComplete(true);
        try {
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers,
                body: JSON.stringify({ workoutId: workout.id, completed: !completed }),
            });

            if (res.ok) {
                if (!completed) {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2'] // Rose theme colors
                    });
                }
                setCompleted(!completed);
            }
        } catch (e) {
            console.error('Failed to mark complete', e);
        } finally {
            setMarkingComplete(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
                </div>
            </DashboardLayout>
        );
    }

    if (!workout) {
        return (
            <DashboardLayout>
                <div className="text-center p-8 text-stone-400">Тренировка не найдена.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="group flex w-fit items-center gap-2 text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    К расписанию курса
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-stone-600">
                                День {workout.dayNumber}
                            </span>
                            {completed && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-500 border border-rose-100">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Выполнено
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-serif text-stone-900 tracking-tight">{workout.title}</h1>
                    </div>

                    <button
                        onClick={handleToggleComplete}
                        disabled={markingComplete || workout.isLocked}
                        className={`flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-medium transition-all shadow-sm ${workout.isLocked
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed hidden md:flex'
                            : completed
                                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                                : 'bg-stone-900 text-white hover:bg-stone-800 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                    >
                        {workout.isLocked ? (
                            <>
                                <Lock className="h-5 w-5" />
                                Завершить Тренировку
                            </>
                        ) : markingComplete ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-400 border-t-stone-800" />
                        ) : completed ? (
                            'Снять отметку'
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                Завершить Тренировку
                            </>
                        )}
                    </button>
                </div>

                {/* Video Player placeholder */}
                <div className="overflow-hidden rounded-3xl bg-stone-100 border border-stone-200 aspect-video relative group shadow-sm shadow-rose-900/5">
                    {workout.videoUrl ? (
                        (() => {
                            const isEmbed = workout.videoUrl.includes('youtube.com') || workout.videoUrl.includes('youtu.be') || workout.videoUrl.includes('vimeo.com');
                            if (isEmbed) {
                                const embedUrl = getEmbedUrl(workout.videoUrl);
                                return (
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-full border-0 absolute top-0 left-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        allowFullScreen
                                        {...{ 
                                            webkitallowfullscreen: "true", 
                                            mozallowfullscreen: "true" 
                                        }}
                                    />
                                );
                            }
                            return (
                                <video
                                    controls
                                    className="w-full h-full object-cover absolute top-0 left-0"
                                    src={workout.videoUrl}
                                    poster={`https://picsum.photos/seed/${workout.id}/800/400?blur=2`}
                                />
                            );
                        })()
                    ) : workout.isLocked ? (
                        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
                                <Lock className="h-8 w-8 text-rose-300" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 font-serif">Тренировка закрыта</h3>
                            <p className="text-sm font-light text-stone-300 max-w-sm">
                                Для просмотра этой тренировки необходим активный тариф. Перейдите в Telegram-бота Лолы, чтобы оплатить доступ.
                            </p>
                            <a href="https://t.me/testfref_bot" target="_blank" rel="noopener noreferrer" className="mt-6 px-6 py-3 bg-rose-500 hover:bg-rose-600 transition-colors rounded-full text-sm font-medium">
                                Оформить подписку
                            </a>
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-400 font-light">
                            Видео скоро появится.
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="rounded-3xl border border-stone-100 bg-white p-8 shadow-sm shadow-rose-900/5 relative overflow-hidden">
                    {workout.isLocked && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 pointer-events-none" />}

                    <h3 className="text-lg font-medium text-stone-900 mb-6 border-b border-stone-100 pb-4">Инструкция от Лолы</h3>
                    <div className="text-stone-600 font-light space-y-4 whitespace-pre-line leading-relaxed relative z-0">
                        {workout.description}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
