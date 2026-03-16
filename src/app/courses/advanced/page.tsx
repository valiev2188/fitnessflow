import Link from 'next/link';

export default function AdvancedCoursePage() {
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
          <div className="relative rounded-[2.5rem] overflow-hidden h-72 mb-12 shadow-2xl shadow-stone-900/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1200&auto=format&fit=crop"
              alt="Продвинутый курс"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 to-stone-900/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <div className="flex gap-2 mb-3">
                <span className="inline-flex w-fit rounded-full bg-violet-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest">Дома</span>
                <span className="inline-flex w-fit rounded-full bg-stone-700 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest">В зале</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif text-white font-bold mb-2">Модуль «Продвинутый»</h1>
              <p className="text-white/80 font-light text-lg">21 домашняя + 12 зальных тренировок</p>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">

              <div>
                <h2 className="text-2xl font-serif text-stone-900 mb-4">О курсе</h2>
                <p className="text-stone-600 font-light leading-relaxed">
                  Продвинутый модуль — для тех, кто уже в теме и хочет настоящих результатов. Полная программа тренировок с раздельными треками для дома и зала.
                  Чередуй форматы или выбери один — система гибкая.
                </p>
                <p className="mt-4 text-stone-600 font-light leading-relaxed">
                  В курс входит <b className="text-stone-800">21 домашняя тренировка</b> (без инвентаря) и <b className="text-stone-800">12 тренировок для зала</b> со снарядами.
                  Каждое занятие сопровождается видео-инструкцией от Лолы.
                </p>
              </div>

              {/* Tabs: home / gym */}
              <div>
                <h2 className="text-2xl font-serif text-stone-900 mb-6">Программа: Дома (21 занятие)</h2>
                <div className="space-y-3">
                  {[
                    { n: 1, title: 'Фуллбоди активация', dur: '35 мин' },
                    { n: 2, title: 'Ягодицы: сила + памп', dur: '40 мин' },
                    { n: 3, title: 'Нижняя часть: ноги полностью', dur: '40 мин' },
                    { n: 4, title: 'Верх тела и спина', dur: '35 мин' },
                    { n: 5, title: 'Кор и пресс: продвинутый уровень', dur: '30 мин' },
                    { n: 6, title: 'HIIT — сжигаем калории', dur: '25 мин' },
                    { n: 7, title: 'Мобильность и гибкость', dur: '25 мин' },
                    { n: 8, title: 'Ягодицы дома. Часть 2', dur: '40 мин' },
                  ].map(w => (
                    <div key={w.n} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-100 hover:border-rose-200 transition-colors group">
                      <div className="w-9 h-9 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center font-semibold text-sm shrink-0 group-hover:bg-violet-500 group-hover:text-white transition-colors">{w.n}</div>
                      <div className="flex-1 font-medium text-stone-900 text-sm">{w.title}</div>
                      <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">{w.dur}</span>
                    </div>
                  ))}
                  <div className="text-center text-sm text-stone-400 italic py-2">+ ещё 13 тренировок в курсе</div>
                </div>

                <h2 className="text-2xl font-serif text-stone-900 mb-6 mt-10">Программа: В зале (12 занятий)</h2>
                <div className="space-y-3">
                  {[
                    { n: 1, title: 'Нижняя часть: штанга и гантели', dur: '50 мин' },
                    { n: 2, title: 'Верх тела: грудь, спина, руки', dur: '50 мин' },
                    { n: 3, title: 'Ягодицы в зале: барbell hip thrust', dur: '45 мин' },
                    { n: 4, title: 'Плечи, трицепс, бицепс', dur: '45 мин' },
                  ].map(w => (
                    <div key={w.n} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-100 hover:border-violet-200 transition-colors group">
                      <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-semibold text-sm shrink-0 group-hover:bg-stone-700 group-hover:text-white transition-colors">{w.n}</div>
                      <div className="flex-1 font-medium text-stone-900 text-sm">{w.title}</div>
                      <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">{w.dur}</span>
                    </div>
                  ))}
                  <div className="text-center text-sm text-stone-400 italic py-2">+ ещё 8 зальных тренировок в курсе</div>
                </div>
              </div>
            </div>

            {/* Sticky buy card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl bg-white border border-stone-100 shadow-xl shadow-rose-900/5 p-8">
                <div className="mb-6">
                  <p className="text-sm text-stone-500 mb-1">Стоимость курса</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-rose-500">450 000</span>
                    <span className="text-stone-500 font-light">сум</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-stone-600 mb-8">
                  {['21 домашняя тренировка', '12 зальных тренировок', 'Доступ навсегда', 'VIP-чат участниц', 'Поддержка от Лолы'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://t.me/vvveins?text=Хочу%20купить%20Продвинутый%20курс%20450%20000%20сум"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-2xl bg-rose-500 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-rose-600 shadow-md shadow-rose-500/25 active:scale-95 mb-3"
                >
                  Купить курс
                </a>
                <a
                  href="https://t.me/vvveins?text=Хочу%20оплатить%20Продвинутый%20через%20Payme%20или%20Click"
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
