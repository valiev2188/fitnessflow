'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
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
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-100 bg-white p-6 transition-all hover:border-rose-200 hover:shadow-xl hover:shadow-rose-900/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-medium text-stone-900">{program.title}</h3>
                                            <div className="mt-2 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
                                                {program.durationDays} Дней • {program.price === 0 ? 'Бесплатно' : `$${(program.price / 100).toFixed(2)}`}
                                            </div>
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-md group-hover:shadow-rose-500/30">
                                            <Play className="h-4 w-4 fill-current" />
                                        </div>
                                    </div>
                                    <p className="mt-5 text-sm font-light text-stone-500 leading-relaxed">
                                        {program.description}
                                    </p>
                                </div>

                                <div className="relative z-10 mt-8 pt-6 border-t border-stone-100">
                                    <Link href={`/dashboard/programs/${program.id}`}>
                                        <button className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/20 active:scale-95">
                                            Смотреть Курс
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
