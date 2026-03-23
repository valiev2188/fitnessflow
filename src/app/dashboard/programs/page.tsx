'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { Play, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
    const { token, loading: authLoading } = useTelegramAuth();
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPrograms() {
            try {
                const res = await fetch('/api/programs', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                setPrograms(data.programs || []);
            } catch (err) {
                console.error('Failed to fetch programs', err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            fetchPrograms();
        }
    }, [token, authLoading]);

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-serif tracking-tight text-stone-900">Программы</h1>
                    <p className="text-stone-500 font-light mt-2">Авторские курсы тренировок, созданные специально для вас.</p>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 animate-pulse rounded-3xl bg-stone-100 border border-stone-50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => {
                            const isAdvanced = program.title.toLowerCase().includes('продвинут');
                            const hasAccess = program.hasAccess;
                            const priceText = program.price === 0 ? 'Бесплатно' : `${program.price.toLocaleString('ru-RU')} сум`;

                            return (
                                <div
                                    key={program.id}
                                    className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-100 bg-white p-6 transition-all ${isAdvanced ? 'opacity-80' : 'hover:border-rose-200 hover:shadow-xl hover:shadow-rose-900/5'}`}
                                >
                                    {isAdvanced && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md">
                                            <div className="rounded-full bg-white/80 p-4 shadow-sm mb-3 text-stone-400">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                            </div>
                                            <span className="text-sm font-bold text-stone-900 uppercase tracking-widest">Скоро в разработке</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-medium text-stone-900">{program.title}</h3>
                                                <div className="mt-2 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
                                                    {program.durationDays} Дней • {priceText}
                                                </div>
                                            </div>
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-md group-hover:shadow-rose-500/30">
                                                <Play className="h-4 w-4 fill-current" />
                                            </div>
                                        </div>
                                        <p className="mt-5 text-sm font-light text-stone-500 leading-relaxed line-clamp-3">
                                            {program.description}
                                        </p>
                                    </div>

                                    <div className="relative z-10 mt-8 pt-6 border-t border-stone-100 flex flex-col gap-2">
                                        <Link href={`/dashboard/programs/${program.id}`}>
                                            <button className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/20 active:scale-95">
                                                {program.price === 0 ? '▶ Начать бесплатно' : '👀 Смотреть программу'}
                                            </button>
                                        </Link>
                                        
                                        {hasAccess ? (
                                            <div className="text-center text-xs font-medium text-rose-600 bg-rose-50 rounded-2xl py-3 border border-rose-100">
                                                ✓ Программа куплена {program.accessUntil ? `до ${new Date(program.accessUntil).toLocaleDateString('ru-RU')}` : ''}
                                            </div>
                                        ) : program.price > 0 ? (
                                            <Link href={`/payment?plan=${encodeURIComponent(program.title)}`}>
                                                <button className="w-full rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition-all hover:bg-rose-500 hover:text-white hover:border-transparent hover:shadow-md hover:shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2">
                                                    <ShoppingBag className="h-4 w-4" />
                                                    Приобрести за {program.price.toLocaleString('ru-RU')} сум
                                                </button>
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
