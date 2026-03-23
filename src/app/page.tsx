"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // ─── EXACT SCRIPT COPY ───

    // Navbar scroll
    const navbar = document.getElementById("navbar");
    const handleScroll = () => {
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // IntersectionObserver for fade-up and pain items
    let io: IntersectionObserver | null = null;
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.12 }
      );

      document.querySelectorAll(".fade-up, .pain-item").forEach((el) => {
        io?.observe(el);
      });
    }

    // FAQ
    const faqBtns = document.querySelectorAll(".faq-q");
    const handleFaqClick = function (this: HTMLElement) {
      const item = this.parentElement;
      if (!item) return;
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    };
    faqBtns.forEach((btn) => {
      btn.addEventListener("click", handleFaqClick as EventListener);
    });

    // Spots countdown (cosmetic)
    let spots = 12;
    let timeoutId: NodeJS.Timeout;
    function decreaseSpots() {
      if (spots > 7 && Math.random() > 0.7) {
        spots--;
        const numEl = document.getElementById("spots-num");
        const inlineEl = document.getElementById("spots-inline");
        if (numEl) numEl.textContent = spots.toString();
        if (inlineEl) inlineEl.textContent = spots.toString();
      }
      timeoutId = setTimeout(decreaseSpots, 30000 + Math.random() * 60000);
    }
    timeoutId = setTimeout(decreaseSpots, 15000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (io) io.disconnect();
      faqBtns.forEach((btn) => {
        btn.removeEventListener("click", handleFaqClick as EventListener);
      });
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="landing-page-wrapper">
      {/* NAV */}
      <nav id="navbar" className="landing-nav">
        <a href="#" className="nav-logo">
          Lola<span>Fitness</span>
        </a>
        <a href="#pricing" className="nav-cta">
          Записаться →
        </a>
      </nav>

      {/* SCARCITY BANNER */}
      <div className="scarcity-banner">
        <span>
          ⚡ Предзапуск — <strong>осталось мест:</strong>
        </span>
        <span className="spots-count">
          <span id="spots-num">12</span> из 30
        </span>
        <span style={{ opacity: 0.6 }}>· Старт потока 1 апреля</span>
      </div>

      {/* HERO */}
      <section className="landing-section" style={{ padding: 0 }}>
        <div className="hero container">
          <div className="hero-left">
            <div className="hero-badge">✦ 21 день · Дома · Без инвентаря</div>
            <h1 className="hero-title">
              Твоё тело,<br />
              <em>твои правила</em>,<br />
              21 день
            </h1>
            <p className="hero-subtitle">
              Авторская программа домашних тренировок от Лолы — без зала, без
              оборудования, <strong>прямо в Telegram</strong>. Результат без
              откатов, болей и срывов.
            </p>
            <div className="hero-cta-group">
              <a href="https://t.me/testfref_bot" className="btn-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.44.7-.9.44l-2.48-1.83-1.2 1.15c-.13.13-.24.24-.5.24l.18-2.5 4.56-4.12c.2-.18-.04-.28-.3-.1L8.9 14.3l-2.42-.76c-.53-.16-.54-.53.11-.78l9.46-3.65c.44-.16.82.1.59.69z"
                    fill="currentColor"
                  />
                </svg>
                Открыть в Telegram
              </a>
              <a href="#pricing" className="btn-outline">
                Оставить заявку →
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">21</span>
                <span className="stat-label">День программы</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">30–40</span>
                <span className="stat-label">Минут в день</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">0</span>
                <span className="stat-label">Инвентаря</span>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-card">
              <img
                className="hero-card-img"
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop"
                alt="Лола — тренер LolaFitness"
              />
              <div className="hero-card-overlay"></div>
              <div className="hero-card-info">
                <div className="hero-card-name">Лола</div>
                <div className="hero-card-desc">
                  Сертифицированный тренер · Пилатес · Функциональный тренинг
                </div>
              </div>
            </div>
            <div className="float-badge">📱 Всё в Telegram</div>
            <div className="float-badge-2">🔥 -43% при предзаписи</div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="landing-section pain-section">
        <div className="container">
          <div className="pain-grid">
            <div>
              <span className="section-label">Узнаёшь себя?</span>
              <h2 className="section-title">
                Это мешает<br />
                <em>тебе начать</em>
              </h2>
              <div className="pain-list">
                <div className="pain-item">
                  <div className="pain-icon">😩</div>
                  <div className="pain-text">
                    <strong>Нет времени на зал</strong>
                    Работа, дом, дела — когда ещё бежать куда-то тренироваться?
                  </div>
                </div>
                <div className="pain-item">
                  <div className="pain-icon">😨</div>
                  <div className="pain-text">
                    <strong>Страшно начинать</strong>
                    Непонятно с чего начать, боишься навредить или выглядеть глупо.
                  </div>
                </div>
                <div className="pain-item">
                  <div className="pain-icon">💸</div>
                  <div className="pain-text">
                    <strong>Пробовала марафоны — не зашло</strong>
                    Срывы, боли, откаты. Деньги потрачены, результата нет.
                  </div>
                </div>
                <div className="pain-item">
                  <div className="pain-icon">📱</div>
                  <div className="pain-text">
                    <strong>Хочется красивый результат, но без страданий</strong>
                    Видишь эстетичные тела в сторис и думаешь: «мне такое не светит».
                  </div>
                </div>
              </div>
            </div>
            <div className="pain-right">
              <div className="solution-title">Я сделала программу специально для тебя</div>
              <p className="solution-text">
                21 день — это не марафон на выживание. Это осознанный путь к телу, которое
                тебе нравится. Каждая тренировка — как разговор со мной лично.
              </p>
              <div className="solution-features">
                <div className="solution-feature">Дома, без оборудования — только коврик</div>
                <div className="solution-feature">30–40 минут в удобное время</div>
                <div className="solution-feature">Авторизация в один клик через Telegram</div>
                <div className="solution-feature">Трекер прогресса каждый день</div>
                <div className="solution-feature">Поддержка Лолы на каждом этапе</div>
                <div className="solution-feature">Без голодовок, без боли, без срывов</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="landing-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrap fade-up">
              <img
                className="about-img"
                src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600&auto=format&fit=crop"
                alt="Лола — тренер"
              />
              <div className="about-exp-badge">
                <span className="exp-num">3+</span>
                <span className="exp-label">Года опыта</span>
              </div>
            </div>
            <div className="fade-up" style={{ transitionDelay: "0.15s" }}>
              <span className="section-label">О тренере</span>
              <h2 className="section-title">
                Привет, я <em>Лола</em>
              </h2>
              <p className="about-text">
                Моя история началась с мечты, которую пришлось защищать. В детстве спорт был под
                запретом — пока все ждали от меня IT-диплома, я втайне сбегала в зал.
              </p>
              <p className="about-text">
                Сегодня я сертифицированный тренер с опытом работы в ведущих студиях Ташкента.
                Для меня фитнес — это не наказание, а <strong>любовь к себе</strong> и инструмент
                раскрытия твоей женственности.
              </p>
              <div className="certs">
                <div className="cert-item">
                  <span className="cert-dot"></span>Пилатес: Mat, Reformer, Cadillac
                </div>
                <div className="cert-item">
                  <span className="cert-dot"></span>Силовой и функциональный тренинг, HIIT, Pump
                </div>
                <div className="cert-item">
                  <span className="cert-dot"></span>Нутрициология — результат комплексно
                </div>
                <div className="cert-item">
                  <span className="cert-dot"></span>Сertified trainer, 22 года
                </div>
              </div>
              <div className="about-studios">
                <span className="studio-tag">Savage</span>
                <span className="studio-tag">Befit Eco</span>
                <span className="studio-tag">World Class</span>
                <span className="studio-tag">X-FIT Premium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="landing-section program-section">
        <div className="container">
          <div className="program-header">
            <div>
              <span className="section-label">Программа</span>
              <h2 className="section-title">
                21 день —<br />
                <em>три недели</em> к результату
              </h2>
            </div>
            <p className="section-text">
              Каждая неделя — новый уровень нагрузки и новое понимание своего тела.
            </p>
          </div>
          <div className="weeks-grid">
            <div className="week-card fade-up">
              <div className="week-num">01</div>
              <div className="week-title">Пробуждение</div>
              <p className="week-desc">
                Мягкий старт. Учимся чувствовать тело, правильно дышать и выстраивать технику.
                Никакого стресса — только удовольствие от движения.
              </p>
              <div className="week-days">
                <span className="day-chip">День 1–7</span>
                <span className="day-chip">30 мин/день</span>
                <span className="day-chip">Базовый уровень</span>
              </div>
            </div>
            <div className="week-card fade-up" style={{ transitionDelay: "0.1s" }}>
              <div className="week-num">02</div>
              <div className="week-title">Разгон</div>
              <p className="week-desc">
                Тело уже привыкло, добавляем интенсивность. Прорабатываем проблемные зоны, видим первые
                изменения в зеркале и в самочувствии.
              </p>
              <div className="week-days">
                <span className="day-chip">День 8–14</span>
                <span className="day-chip">35 мин/день</span>
                <span className="day-chip">Средний уровень</span>
              </div>
            </div>
            <div className="week-card fade-up" style={{ transitionDelay: "0.2s" }}>
              <div className="week-num">03</div>
              <div className="week-title">Трансформация</div>
              <p className="week-desc">
                Финальный недельный рывок. Чувствуешь силу, видишь результат. Тело становится
                таким, каким ты его хотела — без откатов.
              </p>
              <div className="week-days">
                <span className="day-chip">День 15–21</span>
                <span className="day-chip">40 мин/день</span>
                <span className="day-chip">Продвинутый уровень</span>
              </div>
            </div>
          </div>
          <div className="program-includes">
            <div className="include-item">
              <span className="include-icon">🎥</span>
              <div className="include-title">21 видео-тренировка</div>
              <div className="include-desc">HD видео с подробным объяснением техники</div>
            </div>
            <div className="include-item">
              <span className="include-icon">📊</span>
              <div className="include-title">Трекер прогресса</div>
              <div className="include-desc">Отмечай выполненные тренировки каждый день</div>
            </div>
            <div className="include-item">
              <span className="include-icon">🤖</span>
              <div className="include-title">Бот-напоминания</div>
              <div className="include-desc">Ежедневные мотивационные напоминания</div>
            </div>
            <div className="include-item">
              <span className="include-icon">💬</span>
              <div className="include-title">Поддержка Лолы</div>
              <div className="include-desc">Прямой чат и ответы на вопросы</div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="landing-section">
        <div className="container">
          <span className="section-label">Отзывы</span>
          <h2 className="section-title">
            Они уже <em>начали</em>
          </h2>
          <div className="reviews-grid">
            <div className="review-card fade-up">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">
                «После первой же недели поняла, что это не очередной марафон-мучение. Лола
                объясняет каждое движение так, что начинаешь чувствовать своё тело. -4 кг за
                21 день и без голодовок!»
              </p>
              <div className="review-author">
                <div className="review-avatar">👩</div>
                <div>
                  <div className="review-name">Нилуфар, 27 лет</div>
                  <div className="review-meta">Ташкент · прошла 21-дневный курс</div>
                </div>
              </div>
            </div>
            <div className="review-card fade-up" style={{ transitionDelay: "0.1s" }}>
              <div className="review-stars">★★★★★</div>
              <p className="review-text">
                «Наконец-то нашла тренера, к которой хочется возвращаться. Всё через Telegram —
                открыла, потренировалась, отметила галочку. Просто и без лишних приложений.»
              </p>
              <div className="review-author">
                <div className="review-avatar">🌸</div>
                <div>
                  <div className="review-name">Малика, 23 года</div>
                  <div className="review-meta">Ташкент · занимается 2-й месяц</div>
                </div>
              </div>
            </div>
            <div className="review-card fade-up" style={{ transitionDelay: "0.2s" }}>
              <div className="review-stars">★★★★★</div>
              <p className="review-text">
                «Боялась, что без зала результата не будет. Ошибалась. К 21-му дню спина перестала
                болеть, осанка выровнялась, а в зеркале — совсем другая я. Спасибо, Лола!»
              </p>
              <div className="review-author">
                <div className="review-avatar">💪</div>
                <div>
                  <div className="review-name">Зулайхо, 31 год</div>
                  <div className="review-meta">Ташкент · результат после 1 курса</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="landing-section" id="pricing" style={{ background: "var(--cream-dark)" }}>
        <div className="container">
          <div className="pricing-wrap">
            <span className="section-label" style={{ display: "block", textAlign: "center" }}>
              Стоимость
            </span>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              21 день к <em>лучшей себе</em>
            </h2>
            <p className="section-text" style={{ textAlign: "center", margin: "0 auto" }}>
              Сейчас — специальная цена предзапуска. После старта потока цена вернётся к полной.
            </p>

            <div className="pricing-card">
              <div className="price-old">298 990 сум</div>
              <div className="price-new">
                <span className="price-currency">сум </span>169 990
              </div>
              <div className="price-note">Единоразовый платёж · Payme, Click, Rahmat</div>

              <div className="pricing-features">
                <div className="pricing-feature">21 видео-тренировка (30–40 мин каждая)</div>
                <div className="pricing-feature">Трекер прогресса в Telegram WebApp</div>
                <div className="pricing-feature">Ежедневные напоминания от бота</div>
                <div className="pricing-feature">Персональный онбординг под твои цели</div>
                <div className="pricing-feature">Прямая связь с тренером Лолой</div>
                <div className="pricing-feature">Пожизненный доступ к программе</div>
              </div>

              <a href="https://t.me/testfref_bot" className="btn-cta-big">
                🚀 Начать в Telegram
              </a>
              <a
                href="https://t.me/vvveins?text=Хочу%20оставить%20заявку%20на%2021%20день"
                className="btn-cta-outline"
              >
                📋 Оставить предзапись
              </a>

              <div className="spots-warning">
                ⚠️ Осталось <strong id="spots-inline">12</strong> мест из 30 — поток стартует 1 апреля
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFLINE TEASER */}
      <section className="landing-section offline-section">
        <div className="container">
          <div className="offline-card fade-up">
            <span className="offline-emoji">🏋️‍♀️</span>
            <h2 className="offline-title">
              Скоро — <em>офлайн группы</em><br />
              в Ташкенте
            </h2>
            <p className="offline-text">
              Онлайн — это старт. Но мы строим настоящее сообщество. В ближайшее время открываем
              живые групповые тренировки — ограниченное число мест для самых активных участниц курса.
            </p>
            <div className="offline-tags">
              <span className="offline-tag">📍 Ташкент</span>
              <span className="offline-tag">👥 Малые группы</span>
              <span className="offline-tag">🎯 Живые тренировки</span>
              <span className="offline-tag">✨ Только для своих</span>
            </div>
            <a
              href="https://t.me/vvveins?text=Хочу%20в%20офлайн%20группу"
              className="btn-outline"
              style={{ display: "inline-flex" }}
            >
              Хочу в список офлайн →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <span className="section-label">Вопросы</span>
            <h2 className="section-title">
              Часто <em>спрашивают</em>
            </h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <button className="faq-q">
                Нужно ли специальное оборудование? <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                Нет. Тебе понадобится только коврик и немного свободного места. Всё остальное —
                твоё тело и желание двигаться.
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-q">
                Подходит ли программа для новичков? <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                Да, первая неделя специально разработана для тех, кто только начинает. Лола объясняет
                каждое упражнение так, что разберётся любой. Нагрузка нарастает постепенно.
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-q">
                Как проходит оплата? <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                Через Payme, Click или Rahmat. После оплаты Лола вручную активирует твой доступ — это занимает несколько часов в рабочее время. По вопросам — @vvveins в Telegram.
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-q">
                Что значит «предзапись»? <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                Предзапись — это бронь места в первом потоке по специальной цене. Поток стартует 1 апреля. Ты оплачиваешь сейчас, получаешь доступ в день старта.
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-q">
                Почему всё в Telegram? <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                Потому что ты и так там. Никаких новых приложений — открыла бота, нажала кнопку и начала тренировку. Авторизация автоматическая, прогресс сохраняется.
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-q">
                Будут ли офлайн группы? <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                Да! Мы планируем живые групповые тренировки в Ташкенте для самых активных участниц онлайн-курса. Оставь заявку выше, чтобы попасть в список первой.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="landing-section final-cta">
        <div className="container">
          <span className="section-label" style={{ color: "var(--peach-light)" }}>
            Последний шаг
          </span>
          <h2 className="section-title">
            Начни сегодня —<br />
            <em>не «с понедельника»</em>
          </h2>
          <p className="section-text">
            Осталось 12 мест по цене предзапуска. Поток стартует 1 апреля. Твоё тело уже ждёт.
          </p>
          <div className="final-cta-btns">
            <a href="https://t.me/testfref_bot" className="btn-peach">
              🚀 Начать в Telegram
            </a>
            <a href="https://t.me/vvveins?text=Хочу%20оставить%20предзапись" className="btn-ghost">
              📋 Предзапись
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <a href="#" className="nav-logo">
          Lola<span>Fitness</span>
        </a>
        <div className="footer-links">
          <a href="https://t.me/vvveins">Telegram</a>
          <a href="https://t.me/testfref_bot">Бот</a>
        </div>
        <span className="footer-copy">© 2026 LolaFitness · Ташкент</span>
      </footer>
    </div>
  );
}
