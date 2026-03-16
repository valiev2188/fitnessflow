'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Heart, Zap } from 'lucide-react';

export default function LaunchTimer() {
    // Set launch date to 25 days from now (or a fixed date)
    // We use a fixed duration approach relative to when the component mounts 
    // for demonstration, or calculate a fixed end date. Let's calculate a fixed 
    // date 25 days from "now" (which is fixed on first load).
    const [timeLeft, setTimeLeft] = useState({
        days: 25,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Target date: 25 days from right now
        const targetDate = new Date().getTime() + 25 * 24 * 60 * 60 * 1000;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Return a sleek placeholder before hydration to avoid layout shift
    if (!mounted) {
        return <div className="py-20 opacity-0 bg-white"></div>;
    }

    return (
        <section className="py-20 bg-[#FDFBF7] text-stone-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Скоро запуск платформы
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight text-stone-900">
                        Грандиозный запуск <br/><span className="text-rose-500 italic">персональной фитнес-экосистемы</span>
                    </h2>
                    <p className="text-stone-500 max-w-2xl mx-auto text-lg font-light">
                        Всего через несколько дней доступ к LolaFitness откроется для всех. Приготовьтесь к новому стандарту домашних тренировок прямо в Telegram.
                    </p>
                </div>

                {/* The Timer */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-20">
                    {[
                        { label: 'Дней', value: timeLeft.days },
                        { label: 'Часов', value: timeLeft.hours },
                        { label: 'Минут', value: timeLeft.minutes },
                        { label: 'Секунд', value: timeLeft.seconds }
                    ].map((unit, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-20 h-24 md:w-32 md:h-36 bg-white border border-stone-200 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-stone-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-4xl md:text-6xl font-serif text-rose-500">{unit.value.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="mt-4 text-stone-400 text-sm font-medium tracking-widest uppercase">{unit.label}</span>
                        </div>
                    ))}
                </div>

                {/* Unique Selling Propositions */}
                {/* Unique Selling Propositions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto border-t border-stone-200 pt-16">
                    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-stone-100 hover:border-stone-200 shadow-sm transition-all hover:-translate-y-1">
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-medium mb-3 text-stone-900">Никаких новых приложений</h3>
                        <p className="text-stone-500 font-light text-sm leading-relaxed">
                            Вся магия происходит прямо внутри вашего Telegram. Ваша личная студия всегда в кармане, без скачиваний и паролей.
                        </p>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-stone-100 hover:border-stone-200 shadow-sm transition-all hover:-translate-y-1">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                            <Trophy className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-medium mb-3 text-stone-900">Геймификация прогресса</h3>
                        <p className="text-stone-500 font-light text-sm leading-relaxed">
                            Огненные серии, трекинг активности и награды за стабильность. Тренироваться станет интереснее, чем листать ленту.
                        </p>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-stone-100 hover:border-stone-200 shadow-sm transition-all hover:-translate-y-1">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                            <Heart className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-medium mb-3 text-stone-900">Apple-style эстетика</h3>
                        <p className="text-stone-500 font-light text-sm leading-relaxed">
                            Минимализм, плавные анимации и интуитивный дизайн. Забота о каждой детали, чтобы тренировки приносили эстетическое наслаждение.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
