import Link from 'next/link';
import Image from 'next/image';
import { ProgramsSection } from '@/components/ProgramsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-rose-200">
      <header className="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <div className="text-2xl font-serif tracking-tight font-medium">
            <span className="text-stone-900">Lola</span>
            <span className="text-rose-400 italic">Fitness</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#about" className="text-stone-500 transition-colors hover:text-rose-500 uppercase tracking-widest text-xs">Об Авторе</Link>
            <Link href="#features" className="text-stone-500 transition-colors hover:text-rose-500 uppercase tracking-widest text-xs">Подход</Link>
            <Link href="#pricing" className="text-stone-500 transition-colors hover:text-rose-500 uppercase tracking-widest text-xs">Тарифы</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-48 -mt-48 h-[600px] w-[600px] rounded-full bg-rose-200/40 blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-48 -mb-48 h-[600px] w-[600px] rounded-full bg-stone-200/50 blur-3xl opacity-50 pointer-events-none" />

          <div className="container relative mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">

              <div className="flex-1 text-left">
                <div className="mb-6 inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-500">
                  ✨ Здоровое и красивое тело
                </div>

                <h1 className="text-5xl font-serif tracking-tight sm:text-6xl lg:text-7xl text-stone-900 leading-[1.1]">
                  Эстетика и <br />
                  <span className="text-rose-400 italic">женственность</span> <br />
                  в каждом движении
                </h1>

                <p className="mt-8 max-w-xl text-lg text-stone-600 leading-relaxed font-light">
                  Персональная фитнес-платформа, которая делает красивое тело реальностью — прямо в Telegram, без лишних приложений.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row items-center">
                  <a
                    href="https://t.me/LolaFitnessBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center rounded-full bg-stone-900 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Получить приложение
                  </a>
                  <a
                    href="https://t.me/vvveins?text=Хочу%20получить%20инструкцию"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center rounded-full border border-stone-300 bg-transparent px-8 py-4 text-sm font-medium text-stone-700 transition-all hover:border-rose-400 hover:text-rose-500"
                  >
                    Связаться с Лолой
                  </a>
                </div>
              </div>

              {/* Image Placeholder for Lola */}
              <div className="flex-1 relative w-full max-w-md lg:max-w-none">
                <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-200 shadow-2xl shadow-rose-900/10 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop"
                    alt="Тренер Лола"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="font-serif text-2xl font-medium">Лола</p>
                    <p className="text-sm opacity-80 font-light tracking-wide">Дипломированный тренер</p>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full border border-rose-300 opacity-50" />
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full border border-stone-300 opacity-50" />
              </div>

            </div>
          </div>
        </section>

        {/* About Me Section - Мой Путь */}
        <section id="about" className="py-24 bg-white border-t border-stone-100">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1 relative w-full h-[600px] overflow-hidden rounded-[2rem] bg-stone-200 shadow-2xl shadow-rose-900/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop"
                  alt="Тренер Лола на тренировке"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/60 to-transparent p-8">
                  <p className="font-serif text-3xl text-white font-medium mb-1">Лoла</p>
                  <p className="text-white/80 font-light text-sm tracking-widest uppercase">22 года • Тренер-универсал</p>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-serif text-stone-900 sm:text-4xl mb-6">
                  Мой путь: фитнес как <br /><span className="text-rose-400 italic">любовь к себе</span> ❤️
                </h2>
                <div className="space-y-4 text-stone-600 font-light leading-relaxed">
                  <p>
                    Моя история началась не с поддержки, а с мечты, которую пришлось защищать. В детстве спорт был под запретом. Пока я шла по «правильному» пути к IT-диплому, я втайне сбегала в зал, оплачивая тренировки деньгами с обедов.
                  </p>
                  <p>
                    Система готовила меня стать программистом. Но внутреннее стремление быть в движении оказалось сильнее. Я инвестировала всё в знания: конвенции, мастер-классы, новые методики. Получив диплом IT, я могла бы выбрать стабильность, но я выбрала людей.
                  </p>
                  <p className="font-medium text-stone-800">
                    Для меня фитнес — это новое качество жизни, внутренняя опора и раскрытие вашей безупречной женственности.
                  </p>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-stone-100">
                    <h4 className="font-medium text-stone-900 mb-4 uppercase tracking-widest text-xs">Моя Экспертиза</h4>
                    <ul className="space-y-3 text-sm text-stone-600 font-light">
                      <li className="flex items-start gap-3">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span><b className="font-medium text-stone-800">Силовой и функциональный тренинг:</b> Lab, Make Body, Functional, Pump, HIIT, Bootcamp, Step.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span><b className="font-medium text-stone-800">Mind & Body:</b> Пилатес (Mat, Reformer, Cadillac, Chair, Ladder Barrel, Spine Corrector), Core и стретчинг.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span><b className="font-medium text-stone-800">Нутрициология:</b> Консультирую по питанию, помогая достигать целей комплексно и без голодовок.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience / Logos Section */}
        <section id="experience" className="py-20 bg-[#FDFBF7] border-t border-stone-100">
          <div className="container mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-2xl font-serif text-stone-900 mb-3">
              Опыт в лучших <span className="text-rose-400 italic">студиях</span>
            </h2>
            <p className="text-stone-500 font-light max-w-2xl mx-auto mb-12 text-sm">
              За последние 3 года я прошла путь через ведущие фитнес-клубы, чтобы дать вам сервис высшего уровня.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="text-2xl font-serif font-bold text-stone-800 tracking-wider">Savage</div>
              <div className="text-2xl font-sans font-medium text-stone-800 tracking-widest">Befit <span className="text-emerald-600 font-light">Eco</span></div>
              <div className="text-2xl font-serif font-bold text-stone-800 tracking-wider">WORLD CLASS</div>
              <div className="text-xl font-sans font-light text-stone-800 tracking-widest">X-FIT <span className="text-rose-500 font-medium tracking-normal text-sm">PREMIUM</span></div>
            </div>
          </div>
        </section>

        {/* Program Preview Section */}
        <ProgramsSection />

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#1C1C1A] text-white border-t border-stone-800">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4">Наше решение</p>
                <h2 className="text-4xl font-serif sm:text-5xl mb-6">
                  Персональный тренер<br />
                  <span className="text-rose-400 italic">в кармане</span>
                </h2>
                <p className="text-stone-300 font-light mb-12 max-w-lg leading-relaxed">
                  LolaFitness — это Telegram WebApp с авторской программой от сертифицированного тренера. Никаких скачиваний, никаких барьеров. Открыл — тренируйся.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-sm font-bold border border-rose-500/30">✦</div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Telegram WebApp — нулевая фрикция</h4>
                      <p className="text-sm text-stone-400 font-light">Авторизация через Telegram. Никаких дополнительных аккаунтов и приложений.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-sm font-bold border border-rose-500/30">✦</div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Умный онбординг</h4>
                      <p className="text-sm text-stone-400 font-light">Цель, уровень, возраст — система адаптирует программу под конкретного пользователя.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-sm font-bold border border-rose-500/30">✦</div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Дневник прогресса</h4>
                      <p className="text-sm text-stone-400 font-light">Визуализация достижений, трекер тренировок и напоминания от бота каждый день.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-sm font-bold border border-rose-500/30">✦</div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Личная связь с Лолой</h4>
                      <p className="text-sm text-stone-400 font-light">В премиальных тарифах — прямой чат и даже офлайн-встречи с тренером.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-sm lg:max-w-md relative flex justify-center">
                {/* Mockup Frame */}
                <div className="relative rounded-[3rem] border-[8px] border-stone-800 bg-[#FDFBF7] shadow-2xl p-4 w-full aspect-[1/2] overflow-hidden flex flex-col">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-xl z-20"></div>
                  
                  {/* Decorative Video Placeholder */}
                  <div className="flex-1 mt-6 rounded-2xl overflow-hidden bg-stone-100 relative group cursor-pointer border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop" className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Инструкция" />
                    <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center transition-colors group-hover:bg-stone-900/40">
                      <div className="w-16 h-16 rounded-full bg-white/90 text-rose-500 flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <div className="inline-block bg-white/90 backdrop-blur text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        Смотреть инструкцию
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative glows */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-stone-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-[#FDFBF7] border-t border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-48 -mt-48 h-[600px] w-[600px] rounded-full bg-rose-50 blur-3xl opacity-80 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-48 -mb-48 h-[600px] w-[600px] rounded-full bg-stone-100 blur-3xl opacity-50 pointer-events-none" />

          <div className="container relative mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-6 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Скидка -30% на все тарифы 24 часа!
              </div>
              <h2 className="text-3xl font-serif text-stone-900 sm:text-4xl">
                Выберите ваш <span className="text-rose-400 italic">тариф</span>
              </h2>
              <p className="mt-4 text-stone-500 font-light max-w-2xl mx-auto">
                Инвестируйте в свое здоровье и красоту по самой выгодной цене. Чем премиальнее тариф, тем больше ценности вы получаете.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
              {/* 1. Легкий старт */}
              <div className="rounded-3xl bg-white p-8 border border-stone-100 transition-all hover:shadow-xl hover:shadow-rose-900/5 flex flex-col">
                <h3 className="text-2xl font-serif text-stone-900 mb-2">Легкий старт</h3>
                <p className="text-sm text-stone-500 font-light mb-6">Идеально для самостоятельных девушек</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold tracking-tight text-stone-900">$40</span>
                  <span className="text-xl font-medium text-stone-300 line-through">$60</span>
                </div>
                <div className="bg-stone-50 rounded-2xl p-5 mb-8 flex-grow">
                  <p className="font-medium text-sm text-stone-900 mb-4 border-b border-stone-200 pb-2">В тариф входит:</p>
                  <ul className="space-y-4 text-stone-600 font-light text-sm">
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Авторская программа на 21 день</li>
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Подробные видео-инструкции</li>
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Удобный дневник в Telegram WebApp</li>
                  </ul>
                </div>
                <Link href="/payment?plan=Легкий старт" className="block w-full text-center rounded-2xl bg-stone-900 px-6 py-4 text-sm font-medium text-white transition-all hover:bg-stone-800">Выбрать тариф</Link>
              </div>

              {/* 2. Продвинутый (Групповой) */}
              <div className="relative rounded-3xl bg-white p-8 border-2 border-rose-200 shadow-xl shadow-rose-900/10 transform lg:-translate-y-4 flex flex-col">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white shadow-md shadow-rose-400/30">Оптимальный выбор</span>
                </div>
                <h3 className="text-2xl font-serif text-stone-900 mb-2 mt-2">Продвинутый</h3>
                <p className="text-sm text-stone-500 font-light mb-6">Поддержка комьюнити и тренера</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold tracking-tight text-stone-900">$80</span>
                  <span className="text-xl font-medium text-stone-300 line-through">$120</span>
                </div>
                <div className="bg-rose-50/50 rounded-2xl p-5 mb-8 flex-grow border border-rose-100/50">
                  <p className="font-medium text-sm text-rose-600 mb-4 border-b border-rose-100 pb-2">Всё из «Легкого старта», А ТАКЖЕ:</p>
                  <ul className="space-y-4 text-stone-700 font-medium text-sm">
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Доступ в закрытый VIP чат участниц</li>
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Личная поддержка и ответы от Лолы</li>
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Разбор вашей продуктовой корзины</li>
                  </ul>
                </div>
                <Link href="/payment?plan=Продвинутый" className="block w-full text-center rounded-2xl bg-rose-500 px-6 py-4 text-sm font-medium text-white transition-all hover:bg-rose-600 shadow-md shadow-rose-500/30">Выбрать продвинутый</Link>
              </div>

              {/* 3. Индивидуальный */}
              <div className="rounded-3xl bg-white p-8 border border-stone-100 transition-all hover:shadow-xl hover:shadow-rose-900/5 overflow-hidden relative flex flex-col">
                <div className="absolute -right-12 top-7 rotate-45 bg-[#171717] text-white text-[10px] font-bold uppercase tracking-widest px-12 py-1.5 shadow-lg">Premium</div>
                <h3 className="text-2xl font-serif text-stone-900 mb-2">Личное Ведение</h3>
                <p className="text-sm text-stone-500 font-light mb-2">Максимальный фокус на вас</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold tracking-tight text-stone-900">$200</span>
                  <span className="text-xl font-medium text-stone-300 line-through">$300</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-5 mb-8 flex-grow">
                  <p className="font-medium text-sm text-stone-900 mb-4 border-b border-stone-200 pb-2">Всё из «Продвинутого», А ТАКЖЕ:</p>
                  <ul className="space-y-4 text-stone-800 font-medium text-sm">
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> 2 персональные офлайн встречи</li>
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Индивидуальная корректировка техники</li>
                    <li className="flex gap-3"><svg className="h-5 w-5 shrink-0 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Личный чат 24/7 с Лолой</li>
                  </ul>
                </div>
                <Link href="/payment?plan=Индивидуальный" className="block w-full text-center rounded-2xl bg-stone-900 px-6 py-4 text-sm font-medium text-white transition-all hover:bg-stone-800">Занять место</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white text-center text-xs font-light text-stone-400 border-t border-stone-100">
        <p>© 2026 Lola Fitness. Все права защищены.</p>
      </footer>
    </div>
  );
}
