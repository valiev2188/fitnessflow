'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useEffect, useState } from 'react';
import { Home, BookOpen, UtensilsCrossed, ChevronLeft, ChevronDown, User, Zap, ShieldCheck, Calculator, Droplets } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function NutritionModulePage() {
    const { token } = useTelegramAuth();
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState<any[]>([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [hasNutritionAccess, setHasNutritionAccess] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const [calorieLevel, setCalorieLevel] = useState<number>(1400);
    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'home' | 'about' | 'calculator' | 'menu'>('home');

    useEffect(() => {
        async function fetchProfile() {
            if (!token) return;
            try {
                const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setHasNutritionAccess(!!data.hasNutritionAccess);
                setProfile(data.profile || null);
            } catch (e) {}
            finally { setProfileLoading(false); }
        }
        fetchProfile();
    }, [token]);

    useEffect(() => {
        async function fetchSettings() {
            if (!token) return;
            try {
                const res = await fetch('/api/nutrition/settings', { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                if (data.calorieLevel) setCalorieLevel(data.calorieLevel);
            } catch (e) {}
        }
        fetchSettings();
    }, [token]);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/nutrition?calorie=${calorieLevel}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.weeks) setWeeks(data.weeks);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token, calorieLevel]);

    const handleCalorieChange = async (level: number) => {
        setCalorieLevel(level);
        fetch('/api/nutrition/settings', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ calorieLevel: level })
        }).catch(console.error);
    };

    const currentWeekData = weeks.find(w => w.weekNumber === activeWeek);

    if (profileLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F6F6F6]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-400" />
            </div>
        );
    }

    if (!hasNutritionAccess) {
        return (
            <div className="min-h-screen bg-[#F6F6F6] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-sm border border-stone-100 space-y-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                        <UtensilsCrossed className="w-9 h-9 text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 font-serif mb-2">Программа питания</h1>
                        <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                            Пожизненный доступ
                        </div>
                    </div>
                    <ul className="text-left space-y-3 text-[14px] text-stone-600 font-light">
                        {[
                            '🥗 Халяль-рацион на 4 недели (1200–1800 ккал)',
                            '🧮 Калькулятор КБЖУ и ИМТ с сохранением',
                            '📚 Полный гид: метод тарелки, источники белка',
                            '💧 Норма воды по стандартам EFSA / ВОЗ',
                            '🎯 Персональные рекомендации под вашу цель',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-3">
                                <span className="text-base shrink-0">{item.slice(0,2)}</span>
                                <span>{item.slice(3)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2 space-y-3">
                        <a href="https://t.me/testfref_bot?start=nutrition_buy" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-[15px] transition-all shadow-lg shadow-rose-500/25">
                            Купить доступ — 99 000 сум
                        </a>
                        <Link href="/dashboard" className="block text-sm text-stone-400 hover:text-stone-600 transition">
                            ← Вернуться в дашборд
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F6] text-stone-900 font-sans pb-20 overflow-x-hidden">
            <div className="w-full flex justify-between items-center p-6 md:px-12 max-w-7xl mx-auto">
                <Link href="/dashboard" className="flex items-center text-stone-500 hover:text-stone-800 transition font-medium text-sm bg-white px-4 py-2 rounded-full border border-stone-200">
                    <ChevronLeft className="w-5 h-5 mr-1" /> На главную
                </Link>
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
                    <User className="w-6 h-6 text-rose-300" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 md:px-12 gap-8 md:gap-12 items-start mt-4">

                {/* Left Sidebar */}
                <div className="flex flex-row md:flex-col bg-white/90 backdrop-blur-md rounded-[40px] p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full md:w-[110px] items-center justify-around md:justify-start gap-2 border border-white sticky top-6 z-20">
                    <TabButton icon={Home} label="Главная" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <div className="hidden md:block h-px w-8 bg-stone-100 my-1" />
                    <TabButton icon={BookOpen} label="О питании" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
                    <div className="hidden md:block h-px w-8 bg-stone-100 my-1" />
                    <TabButton icon={Calculator} label="Калькул." active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} />
                    <div className="hidden md:block h-px w-8 bg-stone-100 my-1" />
                    <TabButton icon={UtensilsCrossed} label="Меню" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full pb-32">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && <HomeTab key="home" />}
                        {activeTab === 'about' && <AboutTab key="about" />}
                        {activeTab === 'calculator' && <CalculatorTab key="calculator" profile={profile} token={token} />}
                        {activeTab === 'menu' && (
                            <MenuTab
                                key="menu"
                                loading={loading}
                                weeks={weeks}
                                activeWeek={activeWeek}
                                setActiveWeek={setActiveWeek}
                                calorieLevel={calorieLevel}
                                handleCalorieChange={handleCalorieChange}
                                currentWeekData={currentWeekData}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

const TabButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`p-3 md:p-4 rounded-[32px] w-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
            active
            ? 'text-[#D9857B] bg-white shadow-sm'
            : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
        }`}
    >
        <Icon className={`w-6 h-6 ${active ? 'fill-[#D9857B]/10 stroke-[#D9857B]' : 'stroke-current'}`} />
        <span className="text-[10px] md:text-[11px] font-bold tracking-wide uppercase mt-1">{label}</span>
    </button>
);

// ─── HOME TAB ────────────────────────────────────────────────────────────────

const HomeTab = () => (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-12">
        <div className="flex items-center gap-6">
            <div className="relative w-[100px] h-[100px] rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-rose-100 shrink-0">
                <img src="/lola-portrait.jpg" alt="Лола Валиева" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200"; }} className="w-full h-full object-cover" />
                <div className="absolute top-[8px] right-[8px] w-4 h-4 rounded-full bg-green-500 border-2 border-white z-10 shadow-sm"></div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Лола Валиева</h2>
                <p className="text-[15px] font-light text-stone-500">Твой фитнес-тренер</p>
            </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
            <h1 className="text-3xl font-bold text-stone-900 mb-6 flex items-center gap-3 relative z-10">
                Добро пожаловать!
            </h1>
            <p className="text-stone-700 leading-relaxed font-light text-[15px] md:text-[16px] relative z-10">
                Приветствую вас в моей авторской программе питания! Меня зовут Лола Валиева, и я ваш фитнес-тренер. Перед вами полное руководство по питанию от А до Я, со всеми тонкостями и нюансами, основанное на моем опыте.
                <br/><br/>
                Если вы научитесь управлять своим рационом, вам под силу будут любые цели: похудеть, поддержать вес или набрать мышечную массу. С помощью этого руководства вы сможете углубить свои знания в питании и научиться самостоятельно планировать свой рацион.
                <br/><br/>
                В программе мы разберем, почему не работают диеты и голодание, как это влияет на организм и научимся питаться вкусно, сытно, разнообразно и сбалансированно. Будет много всего интересного! Давайте начнем этот путь вместе!
            </p>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
                { label: 'Метод тарелки', desc: 'Простой способ сбалансировать рацион', emoji: '🍽️', tab: 'about' },
                { label: 'Источники белка', desc: 'Лучшие продукты для восстановления', emoji: '💪', tab: 'about' },
                { label: 'Мой калькулятор', desc: 'Считай калории и ИМТ', emoji: '🧮', tab: 'calculator' },
            ].map(card => (
                <div key={card.label} className="bg-white rounded-[28px] p-6 shadow-sm border border-stone-100 flex flex-col gap-3 cursor-default">
                    <span className="text-3xl">{card.emoji}</span>
                    <div>
                        <p className="font-bold text-stone-900 text-[15px]">{card.label}</p>
                        <p className="text-stone-400 text-[13px] font-light mt-0.5">{card.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

// ─── ABOUT TAB ───────────────────────────────────────────────────────────────

const AboutTab = () => (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-12">
        {/* Intro */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-center mt-4">
            <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 font-serif">Вступление</h1>
                <p className="text-[15px] font-light text-stone-600">Смотри лекцию!</p>
            </div>
            <div className="w-full md:w-1/2 aspect-video bg-rose-50 rounded-[24px] relative overflow-hidden flex items-center justify-center border border-rose-100/50 group cursor-pointer">
                <div className="w-16 h-16 bg-rose-400/90 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 z-10">
                    <Zap className="w-8 h-8 fill-current ml-1" />
                </div>
            </div>
        </div>

        {/* Метод тарелки */}
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">Метод тарелки</h1>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100">
                <p className="text-[15px] font-light text-stone-600 mb-8 leading-relaxed">
                    Простой способ сбалансировать каждый приём пищи без подсчёта калорий. Представьте свою тарелку разделённой на части:
                </p>
                {/* Visual plate */}
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-64 h-64 rounded-full border-4 border-stone-200 overflow-hidden shrink-0 shadow-md">
                        {/* 1/2 left - vegetables */}
                        <div className="absolute left-0 top-0 w-1/2 h-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 font-bold text-xl rotate-0">½</span>
                        </div>
                        {/* top-right - protein */}
                        <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-rose-100 flex items-center justify-center">
                            <span className="text-rose-600 font-bold">¼</span>
                        </div>
                        {/* bottom-right - carbs */}
                        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-amber-50 flex items-center justify-center">
                            <span className="text-amber-700 font-bold">¼</span>
                        </div>
                        {/* Center dividers */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/80" />
                            <div className="absolute right-0 top-1/2 w-1/2 h-0.5 bg-white/80" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-4 h-4 rounded-full bg-green-400 shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-stone-900">½ — Овощи и клетчатка</p>
                                <p className="text-sm text-stone-500 font-light mt-1">Салат, капуста, помидор, огурец, брокколи, шпинат, тыква, морковь, авокадо, кабачок, баклажан, редис, зелень</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-4 h-4 rounded-full bg-rose-400 shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-stone-900">¼ — Белки</p>
                                <p className="text-sm text-stone-500 font-light mt-1">Рыба, морепродукты, птица, мясо, яйца, бобовые, тофу</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-4 h-4 rounded-full bg-amber-400 shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-stone-900">¼ — Сложные углеводы</p>
                                <p className="text-sm text-stone-500 font-light mt-1">Пшено, булгур, киноа, бурый рис, макароны из твёрдых сортов, картофель, батат, цельнозерновой хлеб</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-4 h-4 rounded-full bg-stone-300 shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-stone-900">+ Здоровые жиры (небольшое количество)</p>
                                <p className="text-sm text-stone-500 font-light mt-1">Масло (оливковое, льняное), орехи, авокадо</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Обмен веществ */}
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">Обмен веществ</h1>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 mb-6 space-y-4">
                <p className="text-[15px] font-light text-stone-700 leading-relaxed">
                    Обмен веществ или метаболизм — это совокупность всех химических реакций, протекающих в организме. В живом организме непрерывно разрушаются старые молекулы и клетки и образуются новые. Именно этот цикл «разрушение + создание» обеспечивает жизнедеятельность организма, его отклик на тренировки и питание, восстановление после травм и болезней.
                </p>
                <p className="text-[15px] font-light text-stone-700 leading-relaxed">
                    В процессе обмена веществ:<br/>
                    — расщепляются сложные органические соединения из пищи до более простых<br/>
                    — синтезируются необходимые организму вещества: БЖУ, гормоны, нейромедиаторы<br/>
                    — извлекается энергия для поддержания жизни<br/>
                    — выводятся конечные продукты обмена веществ
                </p>
            </div>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 space-y-4 relative overflow-hidden">
                <div className="absolute top-6 left-6 text-rose-300 opacity-50"><ShieldCheck className="w-8 h-8" /></div>
                <p className="text-[15px] font-light text-stone-700 leading-relaxed pl-10 pr-4">
                    Метаболизм состоит из двух процессов: <b className="font-medium text-stone-900">катаболизм</b> — разрушение и <b className="font-medium text-stone-900">анаболизм</b> — создание. Во время тренировки преобладает катаболизм — организм расщепляет запасы для работы мышц. При восстановлении после тренировки — анаболизм, то есть создание мышц и новых запасов энергии.
                </p>
            </div>
        </div>

        {/* КБЖУ */}
        <div className="pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">Что такое КБЖУ?</h1>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 aspect-[3/4] rounded-[32px] bg-emerald-50 relative flex items-center justify-center p-6 border border-emerald-100">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=500" className="object-cover rounded-2xl w-full h-full shadow-sm opacity-80 mix-blend-multiply" alt="Products" />
                </div>
                <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 leading-relaxed font-light text-[15px] text-stone-700">
                    <p>КБЖУ — это калории, белки, жиры и углеводы. Именно они в первую очередь интересуют нас при составлении рациона. Важно учесть потребности каждого конкретного человека и подобрать соотношение КБЖУ именно для него. Не нужно брать рандомные цифры из интернета — используйте вкладку «Калькулятор» для точного расчёта.</p>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        {[
                            { macro: 'Белки', kcal: '4 ккал/г', color: 'bg-rose-50 text-rose-700 border-rose-100' },
                            { macro: 'Углеводы', kcal: '4 ккал/г', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                            { macro: 'Жиры', kcal: '9 ккал/г', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                            { macro: 'Клетчатка', kcal: '2 ккал/г', color: 'bg-green-50 text-green-700 border-green-100' },
                        ].map(m => (
                            <div key={m.macro} className={`rounded-2xl p-4 border ${m.color}`}>
                                <p className="font-bold">{m.macro}</p>
                                <p className="text-sm font-light mt-1">{m.kcal}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Источники белка */}
        <div className="pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">Где брать белок?</h1>
            <p className="text-[15px] text-stone-500 font-light mb-6">Белок на 100 г продукта:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                    { name: 'Грудка индейки', g: 30, pct: '95%', emoji: '🦃' },
                    { name: 'Куриная грудка', g: 30, pct: '80%', emoji: '🍗' },
                    { name: 'Тунец (консервы)', g: 23, pct: '92%', emoji: '🐟' },
                    { name: 'Телапия', g: 26, pct: '81%', emoji: '🐠' },
                    { name: 'Яичные белки', g: 11, pct: '91%', emoji: '🥚' },
                    { name: 'Кальмар', g: 20, pct: '80%', emoji: '🦑' },
                    { name: 'Обезж. творог', g: 20, pct: '80%', emoji: '🥛' },
                    { name: 'Сыворот. протеин', g: 80, pct: '75%', emoji: '💊' },
                ].map(item => (
                    <div key={item.name} className="bg-white rounded-[24px] p-5 border border-stone-100 shadow-sm flex flex-col gap-2">
                        <span className="text-3xl">{item.emoji}</span>
                        <p className="font-bold text-stone-900 text-[13px] leading-tight">{item.name}</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-[#D9857B]">{item.g}г</span>
                        </div>
                        <p className="text-[11px] text-stone-400 font-light">{item.pct} калорийности из белка</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Идеальный завтрак */}
        <div className="pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">Идеальный завтрак</h1>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100">
                <p className="text-[15px] font-light text-stone-600 mb-8">Сбалансированный завтрак состоит из трёх компонентов:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Сложные углеводы',
                            color: 'bg-amber-50 border-amber-100',
                            titleColor: 'text-amber-800',
                            items: ['Гречневая крупа', 'Овсянка', 'Кус-кус', 'Рис', 'Пшено'],
                            emoji: '🌾',
                        },
                        {
                            title: 'Белки',
                            color: 'bg-rose-50 border-rose-100',
                            titleColor: 'text-rose-800',
                            items: ['Омлет', 'Яичница', 'Творог', 'Сыр', 'Греческий йогурт'],
                            emoji: '🥚',
                        },
                        {
                            title: 'Клетчатка',
                            color: 'bg-green-50 border-green-100',
                            titleColor: 'text-green-800',
                            items: ['Киви', 'Груша', 'Отруби', 'Орехи', 'Изюм'],
                            emoji: '🥝',
                        },
                    ].map(col => (
                        <div key={col.title} className={`rounded-[24px] p-6 border ${col.color}`}>
                            <div className="text-2xl mb-3">{col.emoji}</div>
                            <h3 className={`font-bold text-[15px] mb-4 ${col.titleColor}`}>{col.title}</h3>
                            <ul className="space-y-2">
                                {col.items.map(item => (
                                    <li key={item} className="text-[14px] text-stone-600 font-light flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Водный баланс */}
        <div className="pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif flex items-center gap-3">
                <Droplets className="w-8 h-8 text-blue-400" />
                Водный баланс
            </h1>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-blue-50 rounded-[24px] p-6 border border-blue-100 text-center">
                        <p className="text-[13px] text-blue-500 font-bold uppercase tracking-widest mb-2">Женщины</p>
                        <p className="text-4xl font-black text-blue-700">~2.0 л</p>
                        <p className="text-[13px] text-blue-400 font-light mt-1">в день</p>
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-[24px] p-6 border border-blue-100 text-center">
                        <p className="text-[13px] text-blue-500 font-bold uppercase tracking-widest mb-2">Мужчины</p>
                        <p className="text-4xl font-black text-blue-700">~2.5 л</p>
                        <p className="text-[13px] text-blue-400 font-light mt-1">в день</p>
                    </div>
                    <div className="flex-1 bg-rose-50 rounded-[24px] p-6 border border-rose-100 text-center">
                        <p className="text-[13px] text-rose-500 font-bold uppercase tracking-widest mb-2">На тренировку</p>
                        <p className="text-4xl font-black text-rose-600">+500 мл</p>
                        <p className="text-[13px] text-rose-400 font-light mt-1">каждые 30 мин</p>
                    </div>
                </div>
                <div className="bg-stone-50 rounded-[24px] p-6 border border-stone-100">
                    <p className="font-bold text-stone-900 mb-3">Формула расчёта:</p>
                    <p className="text-[15px] text-stone-700 font-light">
                        <span className="font-bold text-[#D9857B]">30–35 мл × ваш вес (кг)</span> в день — рекомендация EFSA (Европейское агентство по безопасности продуктов питания, 2010) и ВОЗ.
                    </p>
                    <p className="text-[13px] text-stone-500 font-light mt-3">Используйте вкладку «Калькулятор» для точного подсчёта вашей нормы воды.</p>
                </div>
                <div className="space-y-3">
                    <p className="font-bold text-stone-900">Советы:</p>
                    {[
                        'Пейте до появления жажды — не дожидаясь её',
                        'Цвет мочи светло-жёлтый = вы пьёте достаточно',
                        'Начинайте день со стакана воды натощак',
                        'Кофе, чай и соки не заменяют чистую воду',
                    ].map(tip => (
                        <div key={tip} className="flex items-start gap-3 text-[14px] text-stone-600 font-light">
                            <span className="text-blue-400 shrink-0 mt-0.5">💧</span>
                            {tip}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Базовый обмен */}
        <div className="pt-4">
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
                <h2 className="text-3xl font-bold text-stone-900 mb-6 font-serif break-words">Базовый обмен веществ</h2>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[80px] font-black leading-none text-[#D9857B] select-none rotate-12">
                    ЭТО<br/>БАЗА
                </div>
                <p className="text-[15px] text-stone-700 font-light leading-relaxed relative z-10 w-full md:w-2/3">
                    Базовый обмен веществ — это количество калорий, которое необходимо каждый день для жизнедеятельности без учёта активности. Эти калории идут на работу мозга, дыхание, сердцебиение, обновление клеток, поддержание иммунитета. Даже если вы весь день лежите на диване — вы всё равно сжигаете калории. Поэтому все калории базового обмена мы обязаны съедать. Иначе начнутся проблемы со здоровьем и самочувствием.
                </p>
            </div>
            <div className="bg-white mt-6 rounded-[32px] p-8 md:p-12 shadow-sm border border-stone-100">
                <p className="text-[15px] text-stone-700 font-light leading-relaxed">
                    Любители жёстких диет часто практикуют урезание калорий до 600–800 ккал в день — это ничтожно мало! Каждый раз, когда вы не доедаете базовые калории, вы берёте у организма в долг. Рано или поздно долг придётся отдавать. Никакая фигура не стоит потери здоровья.
                </p>
            </div>
        </div>
    </motion.div>
);

// ─── CALCULATOR TAB ───────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
    { value: 'lose_weight',   label: 'Сбросить вес',         multiplier: 0.85 },
    { value: 'gain_muscle',   label: 'Набрать мышечную массу', multiplier: 1.10 },
    { value: 'maintain',      label: 'Поддержать вес',        multiplier: 1.00 },
    { value: 'health',        label: 'Улучшить здоровье',     multiplier: 1.00 },
];

const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-4 rounded-2xl border border-stone-100 overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 bg-stone-50 text-[13px] font-semibold text-stone-600 hover:bg-stone-100 transition"
            >
                {title}
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-5 py-4 text-[13px] text-stone-600 font-light leading-relaxed space-y-2">{children}</div>}
        </div>
    );
};

const ACTIVITY_OPTIONS = [
    { value: 1.2,   label: 'Минимальная', desc: 'Сидячий образ жизни, без тренировок' },
    { value: 1.375, label: 'Низкая', desc: '1–3 тренировки в неделю' },
    { value: 1.55,  label: 'Средняя', desc: '3–5 тренировок в неделю' },
    { value: 1.725, label: 'Высокая', desc: '6–7 тренировок в неделю' },
    { value: 1.9,   label: 'Очень высокая', desc: 'Дважды в день или физический труд' },
];

const GOAL_ADVICE: Record<string, string> = {
    lose_weight: 'Совет: следи за дефицитом −15% и добавь кардио 3× в неделю. Приоритет — белок 30%, чтобы сохранить мышцы.',
    gain_muscle: 'Совет: тренируйся 4–5 раз в неделю, ешь с профицитом +10%. Белок — главный макронутриент.',
    maintain: 'Совет: придерживайся метода тарелки и следи за балансом КБЖУ.',
    health: 'Совет: метод тарелки + 8 000 шагов в день. Акцент на цельные продукты и достаточный сон.',
};

function getBmiInfo(bmi: number) {
    if (bmi < 18.5) return { label: 'Дефицит массы', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', pos: 9 };
    if (bmi < 25)   return { label: 'Норма', color: 'text-green-600', bg: 'bg-green-50 border-green-100', pos: 33 };
    if (bmi < 30)   return { label: 'Избыток веса', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100', pos: 55 };
    if (bmi < 35)   return { label: 'Ожирение I', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', pos: 75 };
    return           { label: 'Ожирение II', color: 'text-red-600', bg: 'bg-red-50 border-red-100', pos: 90 };
}

const CalculatorTab = ({ profile, token }: { profile: any; token: string | null }) => {
    const hasData = !!(profile?.height && profile?.weight && profile?.age);
    const [mode, setMode] = useState<'wizard' | 'results'>(hasData ? 'results' : 'wizard');
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    // wizard / editable fields — initialized from profile
    const [gender, setGender] = useState<'female' | 'male'>(profile?.gender === 'male' ? 'male' : 'female');
    const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
    const [height, setHeight] = useState(profile?.height ? String(profile.height) : '');
    const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : '');
    const [activity, setActivity] = useState(1.375);
    const [goal, setGoal] = useState<string>(profile?.goal || 'maintain');

    const inputClass = "w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-[15px] focus:outline-none focus:border-[#D9857B] focus:ring-2 focus:ring-[#D9857B]/20 transition placeholder:text-stone-400";

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        await fetch('/api/profile', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ gender, age, height, weight, goal }),
        });
        setSaving(false);
        setMode('results');
        setStep(1);
    };

    const startWizard = () => { setStep(1); setMode('wizard'); };

    // Computed values (used in results mode)
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const bmi = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : null;
    const bmr = h > 0 && w > 0 && a > 0
        ? gender === 'female' ? 10 * w + 6.25 * h - 5 * a - 161 : 10 * w + 6.25 * h - 5 * a + 5
        : null;
    const goalMultiplier = GOAL_OPTIONS.find(g => g.value === goal)?.multiplier ?? 1;
    const tdee = bmr ? Math.round(bmr * activity) : null;
    const calories = tdee ? Math.round(tdee * goalMultiplier) : null;
    const protein = calories ? Math.round((calories * 0.30) / 4) : null;
    const fat = calories ? Math.round((calories * 0.25) / 9) : null;
    const carbs = calories ? Math.round((calories * 0.45) / 4) : null;
    const waterMl = w > 0 ? Math.round(w * 35) : null;
    const waterGlasses = waterMl ? Math.ceil(waterMl / 250) : null;
    const bmiInfo = bmi ? getBmiInfo(bmi) : null;

    // ── WIZARD MODE ──────────────────────────────────────────────────────────
    if (mode === 'wizard') {
        const stepTitles = ['Ваша цель', 'Параметры тела', 'Уровень активности'];
        const canNext1 = !!goal;
        const canNext2 = !!age && !!height && !!weight;

        return (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 font-serif mb-1">Калькулятор питания</h1>
                    <p className="text-[14px] text-stone-400 font-light">Шаг {step} из 3 — {stepTitles[step - 1]}</p>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#D9857B]' : 'bg-stone-100'}`} />
                    ))}
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 space-y-5">
                    {/* Step 1 — Goal */}
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-3">
                            {GOAL_OPTIONS.map(g => (
                                <button
                                    key={g.value}
                                    onClick={() => setGoal(g.value)}
                                    className={`py-4 px-4 rounded-2xl text-[14px] font-semibold transition-all border text-left ${
                                        goal === g.value
                                            ? 'bg-[#D9857B] text-white border-[#D9857B] shadow-md'
                                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-[#D9857B]/50'
                                    }`}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2 — Body data */}
                    {step === 2 && (
                        <>
                            <div>
                                <label className="block text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-3">Пол</label>
                                <div className="flex gap-3">
                                    {(['female', 'male'] as const).map(g => (
                                        <button key={g} onClick={() => setGender(g)}
                                            className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-all border ${
                                                gender === g
                                                    ? 'bg-[#D9857B] text-white border-[#D9857B] shadow-md'
                                                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-[#D9857B]/50'
                                            }`}
                                        >{g === 'female' ? '♀ Женщина' : '♂ Мужчина'}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-2">Возраст (лет)</label>
                                    <input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} className={inputClass} min="10" max="100" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-2">Рост (см)</label>
                                    <input type="number" placeholder="165" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} min="100" max="250" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-2">Вес (кг)</label>
                                    <input type="number" placeholder="65" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} min="30" max="300" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 3 — Activity */}
                    {step === 3 && (
                        <div className="flex flex-col gap-2">
                            {ACTIVITY_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setActivity(opt.value)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                                        activity === opt.value ? 'border-[#D9857B] bg-rose-50' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                                    }`}
                                >
                                    <span className={`font-bold text-[14px] ${activity === opt.value ? 'text-[#D9857B]' : 'text-stone-700'}`}>{opt.label}</span>
                                    <span className="text-[13px] text-stone-400 font-light ml-2">— {opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    {step > 1 && (
                        <button onClick={() => setStep(s => s - 1)}
                            className="flex-1 py-4 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition"
                        >← Назад</button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 ? !canNext1 : !canNext2}
                            className="flex-1 py-4 rounded-2xl bg-stone-900 text-white font-semibold hover:bg-[#D9857B] transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >Далее →</button>
                    ) : (
                        <button onClick={handleSave} disabled={saving}
                            className="flex-1 py-4 rounded-2xl bg-[#D9857B] text-white font-bold shadow-lg shadow-[#D9857B]/25 hover:bg-[#c97068] transition disabled:opacity-50"
                        >{saving ? 'Сохранение...' : '✓ Сохранить'}</button>
                    )}
                </div>
            </motion.div>
        );
    }

    // ── RESULTS MODE ─────────────────────────────────────────────────────────
    return (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 font-serif mb-1">Калькулятор питания</h1>
                    <p className="text-[14px] text-stone-400 font-light">Формула Миффлина-Сан Жеора · EFSA/ВОЗ</p>
                </div>
                <button onClick={startWizard}
                    className="shrink-0 mt-1 text-[13px] font-medium text-stone-500 hover:text-[#D9857B] border border-stone-200 hover:border-[#D9857B]/50 px-4 py-2 rounded-xl transition whitespace-nowrap"
                >Изменить данные</button>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100">
                <p className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-3">Ваши данные</p>
                <div className="flex flex-wrap gap-3 text-[14px]">
                    <span className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-stone-700">{gender === 'female' ? '♀ Женщина' : '♂ Мужчина'}</span>
                    <span className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-stone-700">{age} лет</span>
                    <span className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-stone-700">{height} см</span>
                    <span className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-stone-700">{weight} кг</span>
                    <span className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5 text-rose-600 font-medium">
                        {GOAL_OPTIONS.find(g => g.value === goal)?.label ?? goal}
                    </span>
                    <span className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-stone-500">
                        {ACTIVITY_OPTIONS.find(o => o.value === activity)?.label}
                    </span>
                </div>
            </div>

            {/* BMI */}
            {bmi && bmiInfo && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 mb-6">Индекс массы тела (ИМТ)</h2>
                    <div className="flex items-center gap-6 mb-6">
                        <div className={`text-5xl font-black ${bmiInfo.color}`}>{bmi.toFixed(1)}</div>
                        <div className={`px-4 py-2 rounded-full border text-sm font-bold ${bmiInfo.bg} ${bmiInfo.color}`}>{bmiInfo.label}</div>
                    </div>
                    <div className="relative">
                        <div className="h-3 rounded-full overflow-hidden" style={{background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 25%, #eab308 50%, #f97316 75%, #ef4444 100%)'}} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-stone-800 shadow transition-all"
                            style={{ left: `clamp(0%, ${bmiInfo.pos}%, 96%)` }} />
                        <div className="flex justify-between text-[11px] text-stone-400 mt-2 font-light">
                            <span>Дефицит</span><span>Норма</span><span>Избыток</span><span>Ожирение</span>
                        </div>
                    </div>
                    <p className="text-[13px] text-stone-400 font-light mt-4">ИМТ = вес (кг) ÷ рост² (м). Норма: 18.5 – 24.9</p>
                    <InfoBlock title="Что означает мой ИМТ?">
                        <p><strong>Менее 18.5</strong> — дефицит массы. Важно увеличить калорийность и консультироваться с врачом.</p>
                        <p><strong>18.5 – 24.9</strong> — норма. Поддерживайте текущий режим питания и активности.</p>
                        <p><strong>25 – 29.9</strong> — избыток веса. Умеренный дефицит калорий и больше движения.</p>
                        <p><strong>30+</strong> — ожирение. Рекомендуется консультация специалиста и постепенное снижение веса.</p>
                        <p className="text-stone-400 mt-2">ИМТ не учитывает состав тела: спортсмены с развитой мускулатурой могут иметь высокий ИМТ при нормальном жире.</p>
                    </InfoBlock>
                </div>
            )}

            {/* Calories */}
            {calories && protein && fat && carbs && tdee && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 mb-2">Суточная норма калорий</h2>
                    <p className="text-[13px] text-stone-400 font-light mb-2">
                        TDEE: {tdee.toLocaleString()} ккал{goalMultiplier !== 1 && ` → скорректировано (×${goalMultiplier})`}
                    </p>
                    <div className="text-6xl font-black text-[#D9857B] mb-8">{calories.toLocaleString()} <span className="text-2xl font-bold text-stone-400">ккал</span></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-rose-50 rounded-[24px] p-5 border border-rose-100 text-center">
                            <p className="text-2xl font-black text-rose-600">{protein}г</p>
                            <p className="text-[12px] font-bold text-rose-400 uppercase tracking-widest mt-1">Белки</p>
                            <p className="text-[11px] text-rose-300 font-light mt-0.5">30%</p>
                        </div>
                        <div className="bg-blue-50 rounded-[24px] p-5 border border-blue-100 text-center">
                            <p className="text-2xl font-black text-blue-600">{fat}г</p>
                            <p className="text-[12px] font-bold text-blue-400 uppercase tracking-widest mt-1">Жиры</p>
                            <p className="text-[11px] text-blue-300 font-light mt-0.5">25%</p>
                        </div>
                        <div className="bg-amber-50 rounded-[24px] p-5 border border-amber-100 text-center">
                            <p className="text-2xl font-black text-amber-600">{carbs}г</p>
                            <p className="text-[12px] font-bold text-amber-400 uppercase tracking-widest mt-1">Углеводы</p>
                            <p className="text-[11px] text-amber-300 font-light mt-0.5">45%</p>
                        </div>
                    </div>
                    {GOAL_ADVICE[goal] && (
                        <div className="mt-6 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 text-[13px] text-rose-700 font-light">
                            {GOAL_ADVICE[goal]}
                        </div>
                    )}
                    <InfoBlock title="Как использовать результат?">
                        <p>Это ваша целевая норма с учётом цели. Старайтесь придерживаться её ±100 ккал в день.</p>
                        <p>Начните с отслеживания питания в приложении (Cronometer, FatSecret) 2–3 недели.</p>
                        <p>Пересчитывайте норму каждые 4–6 недель, если вес изменился более чем на 3 кг.</p>
                    </InfoBlock>
                </div>
            )}

            {/* Water */}
            {waterMl && waterGlasses && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-400" /> Норма воды
                    </h2>
                    <p className="text-[13px] text-stone-400 font-light mb-6">35 мл × вес тела · Источник: EFSA, 2010</p>
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-5xl font-black text-blue-600">{(waterMl / 1000).toFixed(1)} л</span>
                        <span className="text-stone-400 font-light">= {waterMl} мл / день</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: Math.min(waterGlasses, 16) }).map((_, i) => (
                            <div key={i} className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-lg">🥛</div>
                        ))}
                        {waterGlasses > 16 && <span className="text-stone-400 text-sm font-light self-center">+{waterGlasses - 16} ещё</span>}
                    </div>
                    <p className="text-[12px] text-stone-400 font-light mt-3">1 стакан ≈ 250 мл · {waterGlasses} стаканов в день</p>
                    <p className="text-[12px] text-stone-400 font-light mt-1">Не забудьте добавить +500 мл на каждые 30 мин тренировки</p>
                    <InfoBlock title="Советы по гидратации">
                        <p>Выпивайте 1–2 стакана воды сразу после пробуждения — это запускает обмен веществ.</p>
                        <p>В жаркую погоду (+30°C) увеличьте норму на 500–700 мл.</p>
                        <p>Ориентир: моча светло-жёлтого цвета = хорошая гидратация.</p>
                        <p>Не заменяйте воду чаем, соком или газировкой — они не считаются полноценной заменой.</p>
                    </InfoBlock>
                </div>
            )}
        </motion.div>
    );
};

// ─── MENU TAB ────────────────────────────────────────────────────────────────

const MenuTab = ({ loading, weeks, activeWeek, setActiveWeek, calorieLevel, handleCalorieChange, currentWeekData }: any) => (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="relative group">
                <button className="bg-white rounded-[24px] px-8 py-4 font-bold text-stone-800 shadow-sm flex items-center border border-stone-100 hover:bg-stone-50 transition min-w-[200px] justify-between">
                    Неделя {activeWeek} <ChevronDown className="w-5 h-5 ml-2 text-stone-400" />
                </button>
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 w-full overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-30">
                    {weeks.map((w: any) => (
                        <button key={w.id} onClick={() => setActiveWeek(w.weekNumber)} className="w-full text-left px-6 py-4 hover:bg-stone-50 text-stone-700 font-medium">
                            {w.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[28px] p-2 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white flex flex-col md:flex-row md:inline-flex w-full md:w-auto items-stretch md:items-center">
            {[1200, 1400, 1600, 1800].map(level => (
                <button
                    key={level}
                    onClick={() => handleCalorieChange(level)}
                    className={`px-8 py-4 rounded-[24px] font-bold text-[15px] whitespace-nowrap transition-all duration-300 w-full md:w-auto ${
                        calorieLevel === level
                        ? 'bg-[#D9857B] text-white shadow-md shadow-[#D9857B]/30'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                >
                    {level} калорий
                </button>
            ))}
        </div>

        {loading ? (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 w-32 bg-stone-200 rounded-full mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-stone-200 rounded-[40px]"></div>)}
                </div>
            </div>
        ) : (
            <div className="space-y-16">
                {currentWeekData?.days?.map((day: any) => (
                    <div key={day.id}>
                        <h2 className="text-3xl font-bold font-serif text-stone-900 mb-8 tracking-tight">День {day.dayNumber}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {day.meals.map((meal: any) => (
                                <MealCard key={meal.id} meal={meal} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </motion.div>
);

const MealCard = ({ meal }: { meal: any }) => {
    let badgeText = 'Прием пищи';
    let imgUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600&h=600';

    if (meal.type === 'breakfast') {
        badgeText = 'Завтрак';
        imgUrl = 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&q=80&w=600&h=600';
    } else if (meal.type === 'lunch') {
        badgeText = 'Обед';
        imgUrl = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600&h=600';
    } else if (meal.type === 'dinner') {
        badgeText = 'Ужин';
        imgUrl = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600&h=600';
    }

    const formatText = (content: string) => {
        return content.split('+').map((part, index) => {
            if (index === 0) return <span key={index}>{part}</span>;
            return (
                <span key={index}>
                    <span className="text-stone-400 mx-1">+</span>
                    <span className={`font-medium ${index === 1 ? 'text-[#D9857B]' : ''}`}>{part.trim()}</span>
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col gap-5 group cursor-pointer">
            <div className="relative aspect-square w-full rounded-[44px] overflow-hidden shadow-sm border border-stone-100/50 bg-stone-50">
                <img src={imgUrl} alt={badgeText} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full text-[13px] font-bold text-stone-900 shadow-md border border-white z-10 whitespace-nowrap tracking-wide">
                    {badgeText}
                </div>
            </div>
            <p className="text-[14px] text-stone-600 leading-relaxed font-light px-2 relative">
                {formatText(meal.content)}
            </p>
        </div>
    );
};
