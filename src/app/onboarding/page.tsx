'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { ChevronRight, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const GOALS = [
    { value: 'lose_weight', label: 'Похудеть', icon: '🔥', desc: 'Сжечь жир и стать стройнее' },
    { value: 'tone', label: 'Подтянуть тело', icon: '✨', desc: 'Красивый рельеф и упругость' },
    { value: 'gain_muscle', label: 'Набрать мышцы', icon: '💪', desc: 'Сила и мышечная масса' },
    { value: 'health', label: 'Здоровье', icon: '🌿', desc: 'Энергия и самочувствие' },
];

const LEVELS = [
    { value: 'beginner', label: 'Новичок', icon: '🌱', desc: 'Только начинаю заниматься' },
    { value: 'intermediate', label: 'Средний', icon: '🔆', desc: 'Занимаюсь 3–12 месяцев' },
    { value: 'advanced', label: 'Продвинутый', icon: '⚡', desc: 'Более 1 года практики' },
];

function BeginnerAlert({ onClose, onBuy }: { onClose: () => void; onBuy: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl shadow-rose-900/20 border border-rose-100">
                <button onClick={onClose} className="float-right text-stone-400 hover:text-stone-600 transition-colors mb-2">
                    <X className="h-5 w-5" />
                </button>
                <div className="text-center mb-5">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-2xl font-serif text-stone-900 mb-2">Рекомендуем курс «Старт»</h3>
                    <p className="text-stone-500 font-light text-sm leading-relaxed">
                        Для новичков у нас есть специальный курс — <b className="text-stone-800">12 бережных занятий</b>, которые помогут войти в ритм, освоить технику и почувствовать результат.
                    </p>
                </div>
                <div className="bg-rose-50 rounded-2xl p-4 mb-5 border border-rose-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-stone-900">Модуль «Старт»</p>
                            <p className="text-xs text-stone-500 font-light">12 занятий • Без инвентаря</p>
                        </div>
                        <span className="font-bold text-rose-500">150 000 сум</span>
                    </div>
                </div>
                <a
                    href="https://l.rhmt.uz/Zn2lCs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-rose-600 shadow-md shadow-rose-500/25 mb-3 transition-all"
                >
                    Купить курс «Старт»
                </a>
                <button
                    onClick={onClose}
                    className="block w-full text-center rounded-2xl border-2 border-stone-200 px-5 py-3 text-sm font-medium text-stone-600 hover:border-stone-300 transition-all"
                >
                    Продолжить без покупки
                </button>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    const router = useRouter();
    const { user, token, loading: authLoading } = useTelegramAuth();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [showBeginnerAlert, setShowBeginnerAlert] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        goal: '',
        level: '',
        age: '',
        notifications: true,
    });

    useEffect(() => {
        if (user) {
            setForm(f => ({
                ...f,
                firstName: f.firstName || user.first_name || user.name || '',
                lastName: f.lastName || user.last_name || '',
            }));
        }
    }, [user]);

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

    const handleLevelSelect = (value: string) => {
        setForm(f => ({ ...f, level: value }));
        if (value === 'beginner') {
            setShowBeginnerAlert(true);
        }
    };

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ');
        await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                name: fullName,
                phone: form.phone,
                goal: form.goal,
                level: form.level,
                age: form.age,
                notifications: form.notifications,
            }),
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
            {showBeginnerAlert && (
                <BeginnerAlert
                    onClose={() => setShowBeginnerAlert(false)}
                    onBuy={() => {}}
                />
            )}

            <div className="w-full max-w-md">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-rose-400' : 'bg-stone-200'}`} />
                    ))}
                </div>

                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-xl font-serif font-medium text-stone-900">Lola<span className="text-rose-400 italic">Fitness</span></span>
                </div>

                {/* Step 1: Name & Phone */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 1 из 4</p>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Давайте познакомимся ✨</h1>
                            <p className="text-stone-500 font-light mt-2">Как к вам обращаться и куда присылать доступы?</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Имя *</label>
                                    <input
                                        type="text"
                                        placeholder="Анна"
                                        value={form.firstName}
                                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                        className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-rose-400 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Фамилия</label>
                                    <input
                                        type="text"
                                        placeholder="Иванова"
                                        value={form.lastName}
                                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                        className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-rose-400 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Номер телефона *</label>
                                <input
                                    type="tel"
                                    placeholder="+998 90 123 45 67"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full rounded-2xl border-2 border-stone-200 bg-white px-5 py-4 text-stone-900 placeholder-stone-400 focus:border-rose-400 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!form.firstName || !form.phone}
                            className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-40"
                        >
                            Далее <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Goal */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 2 из 4</p>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Какова ваша цель? 🎯</h1>
                            <p className="text-stone-500 font-light mt-2">Это поможет составить идеальную программу</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {GOALS.map(g => (
                                <button
                                    key={g.value}
                                    onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${form.goal === g.value
                                        ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-500/10'
                                        : 'border-stone-200 bg-white hover:border-rose-200'
                                    }`}
                                >
                                    <span className="text-3xl">{g.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-stone-900">{g.label}</p>
                                        <p className="text-sm text-stone-500 font-light">{g.desc}</p>
                                    </div>
                                    {form.goal === g.value && <CheckCircle2 className="h-5 w-5 text-rose-400 ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(1)} className="flex-1 rounded-2xl border-2 border-stone-200 px-6 py-4 font-semibold text-stone-700 hover:border-stone-300 transition-all">
                                Назад
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!form.goal}
                                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-40"
                            >
                                Далее <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Level */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 3 из 4</p>
                            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Ваш уровень 💪</h1>
                            <p className="text-stone-500 font-light mt-2">Честно — это поможет подобрать нагрузку</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {LEVELS.map(l => (
                                <button
                                    key={l.value}
                                    onClick={() => handleLevelSelect(l.value)}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${form.level === l.value
                                        ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-500/10'
                                        : 'border-stone-200 bg-white hover:border-rose-200'
                                    }`}
                                >
                                    <span className="text-3xl">{l.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-stone-900">{l.label}</p>
                                        <p className="text-sm text-stone-500 font-light">{l.desc}</p>
                                    </div>
                                    {form.level === l.value && <CheckCircle2 className="h-5 w-5 text-rose-400 ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(2)} className="flex-1 rounded-2xl border-2 border-stone-200 px-6 py-4 font-semibold text-stone-700 hover:border-stone-300 transition-all">
                                Назад
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!form.level}
                                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-40"
                            >
                                Далее <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Age + Notifications */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-rose-500 uppercase tracking-widest mb-2">Шаг 4 из 4</p>
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
                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${form.notifications ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'}`}
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
                            <button onClick={() => setStep(3)} className="flex-1 rounded-2xl border-2 border-stone-200 px-6 py-4 font-semibold text-stone-700 hover:border-stone-300 transition-all">
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
