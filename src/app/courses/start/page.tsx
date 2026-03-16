import Link from 'next/link';

export default function StartCoursePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-serif tracking-tight font-medium">
            <span className="text-stone-900">Lola</span>
            <span className="text-rose-400 italic">Fitness</span>
          </Link>
          <Link href="/#courses" className="text-stone-500 hover:text-rose-500 text-sm transition-colors">
            ← Все курсы
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <div className="container mx-auto max-w-4xl px-6">

          {/* Hero banner */}
          <div className="relative rounded-[2.5rem] overflow-hidden h-72 mb-12 shadow-2xl shadow-rose-900/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop"
              alt="Курс Старт"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 to-stone-900/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <span className="mb-3 inline-flex w-fit rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest">Для новичков</span>
              <h1 className="text-4xl sm:text-5xl font-serif text-white font-bold mb-2">Модуль «Старт»</h1>
              <p className="text-white/80 font-light text-lg">12 занятий — полное погружение с нуля</p>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">

              <div>
                <h2 className="text-2xl font-serif text-stone-900 mb-4">О курсе</h2>
                <p className="text-stone-600 font-light leading-relaxed">
                  Модуль «Старт» создан специально для тех, кто только начинает свой фитнес-путь или давно не тренировался.
                  За 12 занятий ты освоишь базовые движения, поставишь правильную технику и полюбишь тренировки — без стресса и перегрузок.
                </p>
                <p className="mt-4 text-stone-600 font-light leading-relaxed">
                  Все тренировки проводятся <b className="text-stone-800">дома</b> — никакого инвентаря, никаких залов. Просто ты, коврик и желание стать лучшей версией себя.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif text-stone-900 mb-6">Программа курса</h2>
                <div className="space-y-3">
                  {[
                    { n: 1, title: 'Вводное занятие. Дыхание и осанка', dur: '25 мин' },
                    { n: 2, title: 'Активация глубоких мышц кора', dur: '30 мин' },
                    { n: 3, title: 'Подвижность суставов всего тела', dur: '30 мин' },
                    { n: 4, title: 'Мягкий кор — без скуки', dur: '25 мин' },
                    { n: 5, title: 'Нижняя часть тела: ягодицы и ноги', dur: '35 мин' },
                    { n: 6, title: 'Верх тела: руки, спина, плечи', dur: '30 мин' },
                    { n: 7, title: 'Восстановление и стретчинг', dur: '20 мин' },
                    { n: 8, title: 'Кардио-активация (мягкая)', dur: '30 мин' },
                    { n: 9, title: 'Фуллбоди: всё тело в одной тренировке', dur: '35 мин' },
                    { n: 10, title: 'Лёгкие ноги (антиотёк)', dur: '25 мин' },
                    { n: 11, title: 'Пресс и бока: без скручиваний', dur: '30 мин' },
                    { n: 12, title: 'Финальная тренировка + растяжка', dur: '40 мин' },
                  ].map(w => (
                    <div key={w.n} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-100 hover:border-rose-200 transition-colors group">
                      <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-semibold text-sm shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">{w.n}</div>
                      <div className="flex-1">
                        <p className="font-medium text-stone-900 text-sm">{w.title}</p>
                      </div>
                      <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">{w.dur}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky buy card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl bg-white border border-stone-100 shadow-xl shadow-rose-900/5 p-8">
                <div className="mb-6">
                  <p className="text-sm text-stone-500 mb-1">Стоимость курса</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-rose-500">150 000</span>
                    <span className="text-stone-500 font-light">сум</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-stone-600 mb-8">
                  {['12 видео-тренировок', 'Доступ навсегда', 'Без инвентаря', 'Поддержка тренера', 'Дневник прогресса в боте'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://l.rhmt.uz/Zn2lCs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-2xl bg-rose-500 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-rose-600 shadow-md shadow-rose-500/25 active:scale-95 mb-3"
                >
                  Купить через Rahmat
                </a>
                <a
                  href="https://t.me/vvveins?text=Хочу%20купить%20курс%20Старт%20150%20000%20сум"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-2xl border-2 border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-700 transition-all hover:border-rose-300 hover:text-rose-500"
                >
                  Оплатить через Payme / Click
                </a>

                <p className="mt-4 text-center text-xs text-stone-400">
                  Доступ открывается в Telegram-боте сразу после оплаты
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 bg-white text-center text-xs font-light text-stone-400 border-t border-stone-100">
        <p>© 2026 Lola Fitness. Все права защищены.</p>
      </footer>
    </div>
  );
}
