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
                Добро пожаловать! 🖐️
            </h1>
            <p className="text-stone-700 leading-relaxed font-light text-[15px] md:text-[16px] relative z-10">
                Приветствую вас в моей авторской программе питания! Меня зовут Лола Валиева, и я ваш фитнес-тренер. Перед вами полное руководство по питанию от А до Я, со всеми тонкостями и нюансами, основанное на моем опыте.
                <br/><br/>
                Если вы научитесь управлять своим рационом, вам под силу будут любые цели: похудеть, поддержать вес или набрать мышечную массу. С помощью этого руководства вы сможете углубить свои знания в питании и научиться самостоятельно планировать свой рацион. А также будете знать, как действовать в нестандартных ситуациях: что заказать в ресторане, как не растолстеть во время праздников, что делать после «обжора».
                <br/><br/>
                В программе мы разберем, почему не работают диеты и голодание, как это влияет на организм и научимся питаться вкусно, сытно, разнообразно и сбалансированно. Будет много всего интересного! Давайте начнем этот путь вместе!
            </p>
        </div>
    </motion.div>
);

const AboutTab = () => (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-12">
        {/* Intro Section with mock image styling */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-center mt-4">
            <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 font-serif">Вступление</h1>
                <p className="text-[15px] font-light text-stone-600">Смотри лекцию!</p>
            </div>
            <div className="w-full md:w-1/2 aspect-video bg-rose-50 rounded-[24px] relative overflow-hidden flex items-center justify-center border border-rose-100/50 group cursor-pointer">
                {/* Play button overlay mock */}
                <div className="w-16 h-16 bg-rose-400/90 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 z-10">
                    <Zap className="w-8 h-8 fill-current ml-1" />
                </div>
            </div>
        </div>

        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">
                Обмен веществ
            </h1>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 mb-8 space-y-4">
                <p className="text-[15px] font-light text-stone-700 leading-relaxed">
                    Обмен веществ или метаболизм — это совокупность всех химических реакций, протекающих в организме. В живом организме непрерывно разрушаются старые молекулы и клетки и образуются новые. Именно этот цикл «разрушение + создание» обеспечивает жизнедеятельность организма, его отклик на тренировки и питание, восстановление после травм и болезней.
                </p>
                <p className="text-[15px] font-light text-stone-700 leading-relaxed">
                    В процессе обмена веществ:<br/>
                    — расщепляются сложные органические соединения из пищи до более простых, всасываются в желудочно-кишечный тракт<br/>
                    — синтезируются необходимые организму вещества: БЖУ, гормоны, нейромедиаторы и так далее<br/>
                    — извлекается энергия для поддержания жизни<br/>
                    — выводятся конечные продукты обмена веществ
                </p>
            </div>
            {/* Worm graphic mock */}
            <div className="flex justify-center my-10 relative">
                <div className="w-64 h-24 bg-rose-300 rounded-[40px] shadow-sm transform-gpu -rotate-3 flex items-center justify-center opacity-80 mix-blend-multiply relative">
                    <div className="w-16 h-16 bg-rose-400 rounded-full absolute -top-8 left-8 shadow-sm"></div>
                    <div className="w-20 h-20 bg-rose-400 rounded-full absolute -bottom-6 right-12 shadow-sm"></div>
                </div>
            </div>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 space-y-4 relative overflow-hidden">
                <div className="absolute top-6 left-6 text-rose-300 opacity-50"><ShieldCheck className="w-8 h-8" /></div>
                <p className="text-[15px] font-light text-stone-700 leading-relaxed pl-10 pr-4">
                    Метаболизм состоит из двух процессов, которые неразрывно связаны и постоянно сменяют друг друга. Это <b className="font-medium text-stone-900">катаболизм</b> — разрушение и <b className="font-medium text-stone-900">анаболизм</b> — создание. В процессе катаболизма сложные вещества разрушаются до более простых. В процессе анаболизма создаются сложные вещества из более простых. Например, во время тренировки преобладает катаболизм. Организму нужна энергия на работу мышц, поэтому он расщепляет свои запасы и пускает их в ход. А когда тело восстанавливается после тренировки, преобладает анаболизм, то есть процесс создания (в данном случае мышц и новых запасов энергии).
                </p>
            </div>
        </div>

        <div className="pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif">
                Что такое КБЖУ<br/>и с чем его едят?
            </h1>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 aspect-[3/4] rounded-[32px] bg-emerald-50 relative flex items-center justify-center p-6 border border-emerald-100">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=500" className="object-cover rounded-2xl w-full h-full shadow-sm opacity-80 mix-blend-multiply" alt="Products" />
                </div>
                <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-stone-100 leading-relaxed font-light text-[15px] text-stone-700">
                    <p>КБЖУ — это калории, белки, жиры и углеводы. Именно они в первую очередь интересуют нас при составлении рациона. Важно учесть потребности каждого конкретного человека и подобрать соотношение КБЖУ именно для него. Не нужно брать рандомные цифры из интернета, например, 1200 калорий и думать, что это универсальный рецепт для всех.</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[32px] py-10 text-center shadow-sm border border-stone-100">
            <p className="text-[14px] text-stone-500 font-light max-w-2xl mx-auto px-6 mb-6 leading-relaxed">
                Правильно говорить «килокалория», а не «калория». 1 калория — это ничтожно маленькая величина, поэтому то, что мы обычно называем калорией на самом деле является килокалорией. Вы можете увидеть обозначение «ккал» на упаковках пищевых продуктов. Но для удобства в разговоре и литературе мы говорим «калория», подразумевая килокалории.
            </p>
            <div className="text-4xl md:text-6xl font-black text-stone-900 tracking-tighter">
                1 ккал = 1000 кал
            </div>
        </div>

        <div className="pt-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#D9857B] mb-8 font-serif flex items-center justify-center md:justify-start gap-4">
                Запомни ⭐
            </h2>
            <div className="space-y-4">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 flex items-start gap-6">
                    <span className="text-[#D9857B] text-4xl font-bold font-serif opacity-80">1</span>
                    <p className="text-[15px] text-stone-700 font-light leading-relaxed pt-2">
                        Общая калорийность рациона складывается из БЖУ. Белки и углеводы имеют калорийность — 4 ккал на 1 грамм, жиры — 9 ккал на 1 грамм.
                    </p>
                </div>
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 flex items-start gap-6">
                    <span className="text-[#D9857B] text-4xl font-bold font-serif opacity-80">2</span>
                    <p className="text-[15px] text-stone-700 font-light leading-relaxed pt-2">
                        Общая калорийность рациона влияет на снижение/увеличение/поддержание веса, а баланс БЖУ на качество тела.
                    </p>
                </div>
            </div>
        </div>

        <div className="pt-8">
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
                <h2 className="text-3xl font-bold text-stone-900 mb-6 font-serif break-words">Базовый обмен веществ</h2>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[80px] font-black leading-none text-[#D9857B] select-none rotate-12">
                    ЭТО<br/>БАЗА
                </div>
                <p className="text-[15px] text-stone-700 font-light leading-relaxed relative z-10 w-full md:w-2/3">
                    Базовый обмен веществ или базовый метаболизм — это то количество калорий, которое необходимо человеку каждый день для его жизнедеятельности без учета какой-либо активности. Эти калории идут на обеспечение базовых (жизненно важных!) нужд организма в энергии: работу мозга, дыхание, сердцебиение, обновление клеток, заживление ран, поддержание иммунитета, температуры тела, работу органов пищеварения и так далее. На все те процессы, которые идут скрыто внутри нас, и мы их даже не замечаем. Даже если вы будете целый день лежать на диване, вы все равно будете сжигать калории. Поэтому все калории базового обмена веществ мы должны, просто обязаны есть. Даже если не хочется. Иначе начнутся проблемы со здоровьем, самочувствием, обменом веществ.
                </p>
            </div>
            
            <div className="bg-white mt-6 rounded-[32px] p-8 md:p-12 shadow-sm border border-stone-100 relative">
                <p className="text-[15px] text-stone-700 font-light leading-relaxed">
                    Любители жестких диет часто практикуют урезание калорий до минимума: 600−800 ккал в день. Это ничтожно мало для взрослого человека! Каждый раз, когда вы не доедаете базовые калории, вы берете у организма в долг. Рано или поздно долг придется отдавать либо увеличением калорийности, либо здоровьем. Никакая, даже самая красивая в мире фигура не стоит хоть капли здоровья. К тому же, на такой низкой калорийности можно забыть о росте мышц. А без мышц ваше тело даже с минимальным процентом жира все равно будет выглядеть дрябло и некрасиво. Дело не в низком проценте жира, а в пропорциях и формах тела. Округлые мышечные формы выглядят гораздо приятнее, чем обтянутые кожей кости с плоской обвислой попой. Если вы согласны со мной в этом моменте, значит, нам по пути :)
                </p>
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
