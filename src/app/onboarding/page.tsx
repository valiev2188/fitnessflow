'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Target, Dumbbell, Heart, Flame, ChevronRight, CheckCircle2 } from 'lucide-react';

const GOALS = [
    { value: 'lose_weight', label: 'Похудеть', icon: '🔥', desc: 'Сжечь жир и стать стройнее' },
    { value: 'tone', label: 'Подтянуть тело', icon: '✨', desc: 'Красивый рельеф и упругость' },
    { value: 'gain_muscle', label: 'Набрать мышцы', icon: '💪', desc: 'Сила и мышечная масса' },
    { value: 'health', label: 'Здоровье', icon: '🌿', desc: 'Энергия и самочувствие' },
];

const LEVELS = [
    { value: 'beginner', label: 'Новичок', icon: '🌱', desc: 'Только начинаю заниматься' },
    { value: 'intermediate', label: 'Средний', icon: '🔆', desc: 'Занимаюсь 3-12 месяцев' },
    { value: 'advanced', label: 'Продвинутый', icon: '⚡', desc: 'Более 1 года практики' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { token, loading: authLoading } = useTelegramAuth();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        goal: '',
        level: '',
        age: '',
        notifications: true,
    });

    // Check if already onboarded
    useEffect(() => {
        if (!authLoading && token) {
            fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(data => {
                    if (data.profile?.onboardingCompleted) {
                        router.replace('/dashboard');
                    }
                });
        }
    }, [authLoading, token]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        router.replace('/dashboard');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-rose-400' : 'bg-stone-200'}`} />
                    ))}
                </div>

                {/* Step 1: Goal */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 1 из 3</p>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Какова ваша цель? 🎯</h1>
                            <p className="text-stone-500 font-light mt-2">Это поможет составить идеальную программу</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {GOALS.map(g => (
                                <button
                                    key={g.value}
                                    onClick={() => { setForm(f => ({ ...f, goal: g.value })); }}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${form.goal === g.value
                                            ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-500/10'
                                            : 'border-stone-200 bg-white hover:border-rose-200'
                                        }`}
                                >
                                    <span className="text-3xl">{g.icon}</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">{g.label}</p>
                                        <p className="text-sm text-stone-500 font-light">{g.desc}</p>
                                    </div>
                                    {form.goal === g.value && <CheckCircle2 className="h-5 w-5 text-rose-400 ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!form.goal}
                            className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-40"
                        >
                            Далее <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Level */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 2 из 3</p>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Ваш уровень 💪</h1>
                            <p className="text-stone-500 font-light mt-2">Честно — это поможет подобрать нагрузку</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {LEVELS.map(l => (
                                <button
                                    key={l.value}
                                    onClick={() => setForm(f => ({ ...f, level: l.value }))}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${form.level === l.value
                                            ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-500/10'
                                            : 'border-stone-200 bg-white hover:border-rose-200'
                                        }`}
                                >
                                    <span className="text-3xl">{l.icon}</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">{l.label}</p>
                                        <p className="text-sm text-stone-500 font-light">{l.desc}</p>
                                    </div>
                                    {form.level === l.value && <CheckCircle2 className="h-5 w-5 text-rose-400 ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(1)} className="flex-1 rounded-2xl border-2 border-stone-200 px-6 py-4 font-semibold text-stone-700 hover:border-stone-300 transition-all">
                                Назад
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!form.level}
                                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-40"
                            >
                                Далее <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Age + Notifications */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 3 из 3</p>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Почти готово! 🌟</h1>
                            <p className="text-stone-500 font-light mt-2">Последние детали</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Ваш возраст</label>
                                <input
                                    type="number"
                                    placeholder="например: 25"
                                    value={form.age}
                                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                                    className="w-full rounded-2xl border-2 border-stone-200 bg-white px-5 py-4 text-stone-900 placeholder-stone-400 focus:border-rose-400 focus:outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={() => setForm(f => ({ ...f, notifications: !f.notifications }))}
                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${form.notifications ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'
                                    }`}
                            >
                                <span className="text-3xl">🔔</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-stone-900">Напоминания о тренировках</p>
                                    <p className="text-sm text-stone-500 font-light">Бот напомнит вам каждый день</p>
                                </div>
                                <div className={`h-6 w-11 rounded-full transition-all ${form.notifications ? 'bg-rose-400' : 'bg-stone-300'}`}>
                                    <div className={`h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-all ${form.notifications ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                                </div>
                            </button>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(2)} className="flex-1 rounded-2xl border-2 border-stone-200 px-6 py-4 font-semibold text-stone-700 hover:border-stone-300 transition-all">
                                Назад
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
                            >
                                {saving ? 'Сохраняем...' : '🚀 Начать тренировки!'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
