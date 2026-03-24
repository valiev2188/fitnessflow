---
name: "LolaFitness Development Skill"
description: "Core context, architecture rules, and workflows for developing the LolaFitness Telegram WebApp and Next.js Landing Page."
---

# LolaFitness — Architecture & Development Skill

Эта директива обучает агента понимать общую архитектуру и бизнес-логику проекта "LolaFitness".

## 1. Структура проекта (Monorepo)
Проект является монорепозиторием на базе Next.js (App Router). В нём находятся 3 основных "приложения", работающих вместе:
- **Landing Page (Acquisition):** `src/app/page.tsx`. Описывает курсы. Главная цель — конвертация. Сверстан pixel-perfect по кастомному HTML-шаблону с выделенными изолированными стилями (чтобы не ломать Tailwind-интерфейс в мини-аппе).
- **Dashboard (Telegram Mini App):** `src/app/dashboard/...`. Приложение только для авторизованных пользователей внутри Telegram. Позволяет смотреть курсы, отмечать прогресс, изменять настройки.
- **Admin Panel:** `src/app/admin/...`. Для тренера (Лолы). Позволяет видеть статистику пользователей, управлять подписками, отправлять PUSH-уведомления через бота.

## 2. Логика Авторизации
В Dashboard пользователи заходят **только из Telegram**.
- Используется хук `useTelegramAuth.ts`, который берёт `window.Telegram.WebApp.initData`, отправляет на сервер `/api/auth`, а сервер (проверив хэш с помощью бота) выдает JWT-токен.
- Этот JWT-токен используется во всех последующих запросах к `/api/...` (как `Bearer {token}`).

## 3. Бизнес-логика (Курсы и Подписки)
- **Программы (Programs):** Хранятся в БД таблица `programs`. Основные — "Старт" (21 день) и "Продвинутый".
- **Тренировки (Workouts):** Привязаны к программам по `programId`. Включают видео (чаще всего iframe YouTube/Vimeo) и текстовое описание.
- **Доступ (Subscriptions):** Дается пользователям после оплаты. Таблица `subscriptions`. Если статус `active` и `expiresAt` больше текущей даты — доступ открыт. 
  - На странице `Dashboard -> Programs` мини-апп делает проверку подписок и скрывает кнопку "Купить", если курс уже есть у пользователя.

## 4. Как работать с UI (Dashboard)
- Всегда используйте `DashboardLayout` для страниц внутри мини-аппа.
- Внешний вид должен быть премиальным. **Используйте lucide-react** для иконок.
- Если нужно сделать заглушку (например, курс еще не готов), используйте blur: `bg-white/60 backdrop-blur-md` и блокировку клика.
- Плеер YouTube обязан принимать параметры: `?autoplay=0&rel=0&fs=1&playsinline=1&modestbranding=1` и атрибут `allowFullScreen` для корректной работы AirPlay и полноэкранного режима в Telegram.

## 5. База Данных (Drizzle + Turso SQLite)
- Подключение: `src/db/index.ts`.
- Схема: `src/db/schema.ts`. Обязательно ознакомьтесь с таблицами `users`, `user_profiles`, `programs`, `workouts`, `user_progress`, `subscriptions` перед написанием новых API-маршрутов.
- **Локальный тест DB:** При работе скриптов из папки `scripts/` (например, seed или настройка админа), всегда убеждайтесь, что загружены переменные окружения, так как Turso требует `TURSO_DB_URL` и `TURSO_DB_AUTH_TOKEN`. (Пример запуска: `export $(cat .env.local | xargs) && npx tsx scripts/your-script.ts`).
