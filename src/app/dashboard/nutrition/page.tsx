'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useEffect, useState } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp, Droplets, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NutritionPage() {
    const { token } = useTelegramAuth();
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState<any[]>([]);
    
    const [calorieLevel, setCalorieLevel] = useState<number>(1400);
    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [showGrocery, setShowGrocery] = useState(false);

    // Fetch initial settings
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

    // Fetch data when token or calorieLevel changes
    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/nutrition?calorie=${calorieLevel}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const data = await res.json();
                if (data.weeks) {
                    setWeeks(data.weeks);
                }
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
        // Persist to DB
        fetch('/api/nutrition/settings', { 
            method: 'POST', 
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ calorieLevel: level })
        }).catch(console.error);
    };

    const getMealIconByType = (type: string) => {
        switch (type) {
            case 'breakfast': return <Sun className="h-5 w-5 text-rose-500" />;
            case 'lunch': return <Droplets className="h-5 w-5 text-rose-500" />;
            case 'dinner': return <Moon className="h-5 w-5 text-rose-500" />;
            default: return <Droplets className="h-5 w-5 text-rose-500" />;
        }
    };

    const getMealLabelByType = (type: string) => {
        switch (type) {
            case 'breakfast': return 'Завтрак';
            case 'lunch': return 'Обед';
            case 'dinner': return 'Ужин';
            default: return 'Прием пищи';
        }
    };

    const currentWeekData = weeks.find(w => w.weekNumber === activeWeek);

    return (
        <DashboardLayout>
            <div className="flex flex-col min-h-full pb-20 relative">
                
                {/* Header Phase */}
                <div className="mb-8">
                    <h1 className="text-4xl font-serif text-stone-900 mb-3">Питание</h1>
                    <p className="text-stone-500 leading-relaxed font-light text-[15px]">
                        «Здоровое питание — это не диета, а осознанный выбор, который дарит вашему телу лёгкость, а уму — ясность.» <br/> <i className="text-rose-400 mt-2 block">— LolaFitness</i>
                    </p>
                </div>

                {/* Calorie Picker */}
                <div className="bg-white rounded-[24px] p-2 mb-8 shadow-sm border border-rose-50/50 flex flex-wrap gap-2 md:inline-flex mx-auto md:mx-0">
                    {[1200, 1400, 1600, 1800].map(level => (
                        <button
                            key={level}
                            onClick={() => handleCalorieChange(level)}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-[20px] transition-all duration-300 font-medium text-sm ${
                                calorieLevel === level 
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                : 'text-stone-500 hover:bg-rose-50'
                            }`}
                        >
                            {level} <span className="text-[10px] opacity-80 font-normal uppercase tracking-wider ml-1">ккал</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-12 w-48 bg-stone-100 rounded-full mb-8"></div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-stone-100/50 rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Week Tabs */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-4 border-b border-stone-200 w-full mb-2">
                                {weeks.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => { setActiveWeek(w.weekNumber); setExpandedDay(null); }}
                                        className={`pb-4 px-2 text-[15px] font-medium transition-colors relative ${
                                            activeWeek === w.weekNumber ? 'text-stone-900' : 'text-stone-400'
                                        }`}
                                    >
                                        {w.title}
                                        {activeWeek === w.weekNumber && (
                                            <motion.div layoutId="weekTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            {currentWeekData?.groceryList && (
                                <button 
                                    onClick={() => setShowGrocery(true)}
                                    className="shrink-0 flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-full text-sm font-medium hover:bg-rose-100 transition-colors ml-4 -mt-2"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="hidden md:inline">Покупки</span>
                                </button>
                            )}
                        </div>

                        {/* Days Accordion */}
                        <div className="space-y-4">
                            {currentWeekData?.days?.map((day: any) => (
                                <motion.div 
                                    key={day.id}
                                    layout
                                    className={`bg-white border rounded-3xl overflow-hidden transition-all duration-500 ${
                                        expandedDay === day.dayNumber 
                                        ? 'border-rose-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-rose-900/5' 
                                        : 'border-stone-100 hover:border-rose-100 shadow-sm cursor-pointer'
                                    }`}
                                >
                                    <button 
                                        onClick={() => setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)}
                                        className="w-full flex items-center justify-between p-6 bg-white outline-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg transition-colors ${
                                                expandedDay === day.dayNumber ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {day.dayNumber}
                                            </div>
                                            <h3 className="font-medium text-stone-900 text-lg">День {day.dayNumber}</h3>
                                        </div>
                                        {expandedDay === day.dayNumber ? (
                                            <ChevronUp className="h-5 w-5 text-stone-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-stone-400" />
                                        )}
                                    </button>
                                    
                                    <AnimatePresence>
                                        {expandedDay === day.dayNumber && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="px-6 pb-6 pt-2"
                                            >
                                                <div className="space-y-4">
                                                    {day.meals.map((meal: any) => (
                                                        <div key={meal.id} className="flex gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-rose-50">
                                                            <div className="mt-1 flex-shrink-0">
                                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center">
                                                                    {getMealIconByType(meal.type)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-1.5">
                                                                    {getMealLabelByType(meal.type)}
                                                                </div>
                                                                <p className="text-[15px] text-stone-700 leading-relaxed font-light">
                                                                    {meal.content.split('+').map((item: string, idx: number) => (
                                                                        <span key={idx}>
                                                                            {item.trim()}
                                                                            {idx < meal.content.split('+').length - 1 && (
                                                                                <span className="mx-1.5 text-rose-400 font-medium">+</span>
                                                                            )}
                                                                        </span>
                                                                    ))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Grocery List Bottom Sheet / Modal */}
                <AnimatePresence>
                    {showGrocery && (
                        <>
                            <div 
                                className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 transition-opacity"
                                onClick={() => setShowGrocery(false)}
                            />
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] p-6 pb-12 shadow-2xl md:max-w-md md:left-1/2 md:-translate-x-1/2 md:pb-8 flex flex-col h-[85vh] md:h-[70vh]"
                            >
                                <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6" />
                                
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-serif text-stone-900">Список покупок</h2>
                                    <button 
                                        onClick={() => setShowGrocery(false)}
                                        className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="bg-rose-50 text-rose-800 text-sm p-4 rounded-2xl mb-6 font-medium">
                                        Продукты для плана "{currentWeekData?.title}" (калорийность {calorieLevel} ккал)
                                    </div>
                                    
                                    <ul className="space-y-4">
                                        {currentWeekData?.groceryList.split(',').map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                                                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-stone-200 flex-shrink-0" />
                                                <span className="text-[15px] font-light text-stone-700 capitalize-first leading-snug">
                                                    {item.trim()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                
                <style jsx global>{`
                    .capitalize-first::first-letter { text-transform: capitalize; }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
                `}</style>
            </div>
        </DashboardLayout>
    );
}
