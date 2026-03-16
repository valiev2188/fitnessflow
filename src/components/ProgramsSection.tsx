'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

export function ProgramsSection() {
    const [category, setCategory] = useState<'courses' | 'marathons'>('courses');
    const [module, setModule] = useState<'start' | 'advanced'>('start');

    return (
        <section id="program" className="py-24 bg-[#FAF8F5] border-t border-stone-100 overflow-hidden">
            <div className="container mx-auto max-w-6xl px-6">
                <div className="mb-12 text-center md:text-left">
                    <h2 className="text-3xl font-serif text-stone-900 sm:text-4xl">
                        Наши <span className="text-rose-400 italic">программы</span>
                    </h2>
                    <p className="mt-4 text-stone-500 font-light max-w-2xl">
                        Выберите подходящий формат тренировок. Мы предлагаем курсы для разных уровней подготовки и интенсивные марафоны.
                    </p>
                </div>

                {/* Categories */}
                <div className="flex gap-4 mb-12 border-b border-stone-200 pb-4">
                    <button
                        onClick={() => setCategory('courses')}
                        className={`text-lg font-medium transition-all px-4 py-2 rounded-full ${category === 'courses' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        Курсы
                    </button>
                    <button
                        onClick={() => setCategory('marathons')}
                        className={`text-lg font-medium transition-all px-4 py-2 rounded-full ${category === 'marathons' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        Марафоны
                    </button>
                </div>

                {category === 'marathons' ? (
                    <div className="py-12 text-center bg-white rounded-3xl border border-stone-100 shadow-sm">
                        <div className="text-5xl mb-4">🏃‍♀️</div>
                        <h3 className="text-2xl font-serif text-stone-900 mb-2">Скоро...</h3>
                        <p className="text-stone-500 font-light max-w-md mx-auto">
                            Наши марафоны находятся в разработке. Подпишитесь на бота, чтобы не пропустить запуск!
                        </p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Modules Selection */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-medium text-stone-900 mb-2">Выберите модуль:</h3>
                            
                            <div
                                onClick={() => setModule('start')}
                                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all ${module === 'start' ? 'border-rose-400 bg-white shadow-lg' : 'border-stone-100 bg-white hover:border-rose-200'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-lg font-semibold text-stone-900">Модуль «Старт»</h4>
                                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">Для новичков</span>
                                </div>
                                <p className="text-stone-500 text-sm mb-4 leading-relaxed">
                                    Идеально для тех, кто только начинает. 12 бережных занятий, чтобы освоить азы, правильную технику и полюбить движение без стресса.
                                </p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
                                    <span className="font-bold text-stone-900">150 000 сум</span>
                                    {module === 'start' && (
                                        <a href="https://l.rhmt.uz/Zn2lCs" target="_blank" rel="noopener noreferrer" className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20">
                                            Оплатить в Rahmat
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div
                                onClick={() => setModule('advanced')}
                                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all ${module === 'advanced' ? 'border-rose-400 bg-white shadow-lg' : 'border-stone-100 bg-white hover:border-rose-200'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-lg font-semibold text-stone-900">Модуль «Продвинутый»</h4>
                                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">С опытом</span>
                                </div>
                                <p className="text-stone-500 text-sm mb-4 leading-relaxed">
                                    Полноценная программа на результат. Включает 21 домашнюю тренировку и 12 тренировок для зала. Чередуйте или выбирайте свой формат.
                                </p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
                                    <span className="font-bold text-stone-900">Скоро</span>
                                    {module === 'advanced' && (
                                        <a href="https://l.rhmt.uz/Zn2lCs" target="_blank" rel="noopener noreferrer" className="bg-stone-200 text-stone-500 cursor-not-allowed px-5 py-2 rounded-full text-sm font-medium transition-colors">
                                            Тестовая ссылка
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Module Details Preview */}
                        <div className="relative">
                            <div className="rounded-[2.5rem] bg-stone-900 p-3 pb-0 shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
                                <div className="bg-[#FDFBF7] rounded-t-[2rem] flex-1 overflow-y-auto flex flex-col relative">
                                    <div className="bg-white px-6 py-4 border-b border-stone-100 flex items-center justify-between sticky top-0 z-10">
                                        <span className="font-serif text-lg font-medium">{module === 'start' ? 'Превью: Старт' : 'Превью: Продвинутый'}</span>
                                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">Л</div>
                                    </div>
                                    
                                    <div className="p-6">
                                        {module === 'start' ? (
                                            <>
                                                <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-sm">12</span>
                                                    Тренировок в модуле
                                                </h3>
                                                <div className="space-y-3">
                                                    {[
                                                        "Вводное занятие. Дыхание",
                                                        "Активация глубоких мышц",
                                                        "Подвижность суставов",
                                                        "Мягкий кор"
                                                    ].map((t, i) => (
                                                        <div key={i} className="bg-white p-4 rounded-xl border border-stone-100 flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center"><Play className="w-4 h-4 text-stone-400" /></div>
                                                            <span className="text-sm font-medium text-stone-800">{t}</span>
                                                        </div>
                                                    ))}
                                                    <div className="text-center text-xs text-stone-400 mt-4 italic">И еще 8 занятий...</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex gap-2 mb-6">
                                                    <div className="flex-1 text-center bg-stone-900 text-white rounded-lg py-2 text-xs font-medium">Дома (21)</div>
                                                    <div className="flex-1 text-center bg-stone-100 text-stone-500 rounded-lg py-2 text-xs font-medium">В зале (12)</div>
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        "Фулбоди интенсив",
                                                        "Ягодицы: сила + памп",
                                                        "Здоровая спина и осанка"
                                                    ].map((t, i) => (
                                                        <div key={i} className="bg-white p-4 rounded-xl border border-stone-100 flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center"><Play className="w-4 h-4 text-stone-400" /></div>
                                                            <span className="text-sm font-medium text-stone-800">{t}</span>
                                                        </div>
                                                    ))}
                                                    <div className="text-center text-xs text-stone-400 mt-4 italic">Полная программа...</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-yellow-200/50 rounded-full mix-blend-multiply blur-3xl pointer-events-none -z-10"></div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
