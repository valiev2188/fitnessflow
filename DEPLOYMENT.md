# Деплой FitnessFlow (Инструкция для Production)

Этот проект подготовлен для запуска на сервере. Для того чтобы приложение начало работать для реальных пользователей из Telegram, нужно выполнить два основных шага: разместить базу данных и разместить сам сайт.

## Шаг 1: База данных (Turso / Neon)

В разработке использовалась локальная база SQLite (файл `local.db`). Для Production нужна облачная база данных. Вы можете использовать либо бесплатный **Turso** (libSQL/SQLite) либо **Neon** (Serverless PostgreSQL).

Рекомендуемый и самый простой вариант — Turso (т.к. мы уже настроили Drizzle для SQLite):
1. Зарегистрируйтесь на сайте [Turso](https://turso.tech/).
2. Создайте новую базу данных: `turso db create fitnessflow`
3. Получите URL базы данных и Auth Token.
4. В файле `drizzle.config.ts` убедитесь, что `dialect: 'sqlite'` и используется ваш новый турсо URL.
5. Для подключения Drizzle к Turso, добавьте `DATABASE_URL` вида `libsql://ваша-база-turso.turso.io?authToken=ваш_токен` в Production Env.

*Если хотите классический PostgreSQL (Neon)*:
1. Зарегистрируйтесь на [Neon.tech](https://neon.tech/).
2. Получите строку подключения (Connection String).
3. Измените в `drizzle.config.ts` параметр `dialect: 'postgresql'`, удалите старую папку миграций и запустите `npx drizzle-kit generate` и `npx drizzle-kit push` заново.
4. В коде потребуется заменить импорты `drizzle-orm/libsql` на `drizzle-orm/neon-http`. (Для максимальной простоты оставайтесь на SQLite/Turso).

## Шаг 2: Деплой на Vercel

Vercel — идеальный бесплатный хостинг для Next.js приложений.

1. Залейте ваш проект на **GitHub**.
2. Создайте аккаунт на [Vercel](https://vercel.com/) и свяжите его с GitHub.
3. Нажмите **Add New Project** и выберите ваш репозиторий `fitnessflow`.
4. В разделе **Environment Variables** (переменные окружения) вам нужно добавить следующие ключи (с вашими реальными данными):

| Ключ | Описание |
|------|-----------|
| `DATABASE_URL` | Ссылка на вашу Production базу данных (Turso/Neon) |
| `TELEGRAM_BOT_TOKEN` | Токен бота от BotFather (например, `8272...`) |
| `NEXT_PUBLIC_BOT_USERNAME` | Юзернейм вашего бота (например, `testfref_bot`, без @) |
| `ADMIN_TELEGRAM_ID` | Ваш реальный Telegram ID цифрами (можно узнать у @userinfobot) |
| `JWT_SECRET` | Длинная случайная строка для шифрования токенов |

5. Нажмите **Deploy**. Vercel соберет проект и выдаст вам ссылку вида `https://fitnessflow-murex.vercel.app`.

## Шаг 3: Настройка Telegram Bot

1. Откройте **BotFather** в Telegram.
2. Выберите вашего бота и перейдите в **Bot Settings** 👉 **Menu Button** 👉 **Configure menu button**.
3. Установите ссылку (URL), которую вам выдал Vercel (например, `https://fitnessflow-murex.vercel.app/`). 
4. То же самое сделайте в настройках WebApp (если используете команду `/setmenubutton`).
5. Теперь когда пользователь нажмет кнопку "Открыть приложение" в боте, откроется ваш сайт внутри Telegram.

## Поддержка Видео

В Админке или через базу данных вы можете загружать тренировки (`Workouts`).
Поле `videoUrl` теперь поддерживает:
- **Прямые ссылки на MP4** (будут играть во встроенном плеере)
- **Ссылки на YouTube** (например, `https://www.youtube.com/watch?v=...` или `https://youtu.be/...`)
- **Ссылки на Vimeo** (например, `https://vimeo.com/76979871`)

Система автоматически распознает формат ссылки и встроит нужный плеер.
