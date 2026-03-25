'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useEffect, useState } from 'react';
import { Home, BookOpen, UtensilsCrossed, ChevronLeft, ChevronDown, User, Zap, CircleChevronUp, CircleChevronDown, Info, ShieldCheck, Fish, Beef } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function NutritionModulePage() {
    const { token } = useTelegramAuth();
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState<any[]>([]);
    
    const [calorieLevel, setCalorieLevel] = useState<number>(1400);
    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'home' | 'about' | 'menu'>('home');

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

    const currentWeekData = weeks.find(w => w.weekNumber === activeWeek);

    return (
        <div className="min-h-screen bg-[#F6F6F6] text-stone-900 font-sans pb-20 overflow-x-hidden">
            {/* Header with back button & avatar */}
            <div className="w-full flex justify-between items-center p-6 md:px-12 max-w-7xl mx-auto">
                <Link href="/dashboard/programs" className="flex items-center text-stone-500 hover:text-stone-800 transition font-medium text-sm bg-white px-4 py-2 rounded-full border border-stone-200">
                    <ChevronLeft className="w-5 h-5 mr-1" /> К программам
                </Link>
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
                    <User className="w-6 h-6 text-rose-300" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 md:px-12 gap-8 md:gap-12 items-start mt-4">
                
                {/* Left Floating Sidebar */}
                <div className="flex flex-row md:flex-col bg-white/90 backdrop-blur-md rounded-[40px] p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full md:w-[110px] items-center justify-around md:justify-start gap-2 border border-white sticky top-6 z-20">
                    <TabButton icon={Home} label="Главная" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <div className="hidden md:block h-px w-8 bg-stone-100 my-2" />
                    <TabButton icon={BookOpen} label="О питании" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
                    <div className="hidden md:block h-px w-8 bg-stone-100 my-2" />
                    <TabButton icon={UtensilsCrossed} label="Меню" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full pb-32">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && <HomeTab key="home" />}
                        {activeTab === 'about' && <AboutTab key="about" />}
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

const TabButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => {
    return (
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
}

const HomeTab = () => (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-12">
        <div className="flex items-center gap-6">
            <div className="relative w-[100px] h-[100px] rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-rose-100 shrink-0">
                <img src="/lola-portrait.jpg" alt="Лола" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200"; }} className="w-full h-full object-cover" />
                <div className="absolute top-[8px] right-[8px] w-4 h-4 rounded-full bg-green-500 border-2 border-white z-10 shadow-sm"></div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Антонина</h2>
                <p className="text-[15px] font-light text-stone-500">Твой фитнес-тренер</p>
            </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
            <h1 className="text-3xl font-bold text-stone-900 mb-6 flex items-center gap-3 relative z-10">
                Добро пожаловать! 🖐️
            </h1>
            <p className="text-stone-700 leading-relaxed font-light text-[15px] md:text-[16px] relative z-10">
                Приветствую вас в моей программе питания! Перед вами полное руководство по питанию от А до Я, со всеми тонкостями и нюансами. Если вы научитесь управлять своим рационом, вам под силу будут любые цели: похудеть, поддержать вес или набрать мышечную массу. С помощью этого руководства вы сможете углубить свои знания в питании и научиться самостоятельно планировать свой рацион. А также будете знать, как действовать в нестандартных ситуациях: что заказать в ресторане, как не растолстеть во время праздников, что делать после «обжора».
                <br/><br/>
                В программе мы разберем, почему не работают диеты и голодание, как это влияет на организм и научимся питаться вкусно, сытно, разнообразно и сбалансированно. Будет много всего интересного!
            </p>
        </div>
    </motion.div>
);

const AboutTab = () => (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 mt-4 text-center md:text-left font-serif">
            Основы правильного питания
        </h1>
        
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 mb-8">
            <p className="text-[15px] md:text-[16px] font-light text-stone-700 leading-relaxed">
                Питание — это главный инструмент достижения результата. Любые, даже самые тяжелые тренировки не помогут его увидеть, пока в вашей тарелке беспорядок. У пищи есть несколько целей. Главная — это обеспечить организм энергией и всеми необходимыми питательными веществами для его нормальной жизнедеятельности. Но это не все. Еда должна вызывать аппетит, приносить наслаждение как визуальное, так и вкусовое. Прием пищи должен утолять голод и давать чувство сытости на долго. Еда должна быть качественной и безвредной. Необходимо учитывать пищевые ограничения: непереносимости, аллергии, вкусовые предпочтения и лечебные диеты для больных людей. Теперь разберем подробнее каждую цель.
            </p>
        </div>

        <div className="space-y-6">
            {/* Battery */}
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1 order-2 md:order-1">
                    <h2 className="text-2xl font-bold text-stone-900 mb-4">Цель 1</h2>
                    <p className="text-[15px] font-light text-stone-600 leading-relaxed">
                        — обеспечение энергией и всеми необходимыми питательными веществами. Калории из пищи должны давать вам энергию на все ваши дела и вообще на поддержание вашей жизни. Это самая главная цель пищи. Кроме калорий нас интересуют полезные вещества, которые содержатся в еде. В разных продуктах содержится разный набор веществ. Чтобы получать их все, нужно питаться разнообразно. При таком питании потребность в приеме БАДов существенно снижается.
                    </p>
                </div>
                <div className="w-40 h-40 shrink-0 order-1 md:order-2">
                    <Zap className="w-full h-full text-[#34C759] p-6 bg-[#34C759]/10 rounded-[40px] border-[8px] border-white shadow-md relative z-10" strokeWidth={1} fill="currentColor" />
                </div>
            </div>
            
            {/* Burger */}
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="w-40 h-40 shrink-0 order-1">
                    <Beef className="w-full h-full text-amber-600 p-6 bg-amber-50 rounded-[40px] border-[8px] border-white shadow-md relative z-10" strokeWidth={1} fill="currentColor" />
                </div>
                <div className="flex-1 order-2">
                    <h2 className="text-2xl font-bold text-stone-900 mb-4">Цель 3</h2>
                    <p className="text-[15px] font-light text-stone-600 leading-relaxed">
                        — утоление голода и сытость на долго. Многие худеющие допускают ошибку, когда пытаются перебить аппетит. У нас нет цели просто забить живот низкокалорийными продуктами типа листьев салата или грейпфрута. Важно именно наесться, утолить свою ЕСТЕСТВЕННУЮ потребность организма. Голод — это сигнал, который нельзя игнорировать. Если вы будете чувствовать голод, то существенно повысится риск съесть гораздо больше еды плохого качества (сладости, фастфуд). Потому что голодный человек теряет человеческий облик :)
                    </p>
                </div>
            </div>

            {/* Fish */}
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1 order-2 md:order-1">
                    <h2 className="text-2xl font-bold text-stone-900 mb-4">Цель 4</h2>
                    <p className="text-[15px] font-light text-stone-600 leading-relaxed">
                        — доброкачественность. Важно быть на 100% уверенным, что в вашей тарелке лежит качественный продукт, который не приведет к отравлению. Обращайте внимание на запах и внешний вид еды. Не должно быть неприятного запаха, плесени, брожения, грязи. Убедитесь, что сроки и правила хранения продукта не были нарушены. Очевидно, не стоит употреблять пищу, которая вызывает у вас аллергическую реакцию или индивидуальную непереносимость. Даже если очень хочется :) Учитесь выбрасывать ненужные или непригодные продукты.
                    </p>
                </div>
                <div className="w-40 h-40 shrink-0 order-1 md:order-2">
                    <Fish className="w-full h-full text-slate-500 p-6 bg-slate-100 rounded-[40px] border-[8px] border-white shadow-md relative z-10" strokeWidth={1} fill="currentColor" />
                </div>
            </div>
        </div>
    </motion.div>
);

const MenuTab = ({ loading, weeks, activeWeek, setActiveWeek, calorieLevel, handleCalorieChange, currentWeekData }: any) => {
    return (
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

                <button className="bg-white rounded-[24px] px-8 py-4 font-bold text-stone-800 shadow-sm border border-stone-100 hover:bg-stone-50 transition">
                    Как пользоваться
                </button>
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
};

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

    // Attempt to parse out the highlighted main dish, e.g text after '+' up to '(' or just color first few words.
    // In screenshots, 'кремовая овсянка' or 'пицца на курином филе' is highlighted in pink.
    // For a generic approach, we format it with standard style, and maybe highlight anything before '('
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
                <img 
                    src={imgUrl} 
                    alt={badgeText} 
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                />
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
