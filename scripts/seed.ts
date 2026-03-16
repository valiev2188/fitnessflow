import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });

const client = createClient({
    url: process.env.TURSO_DB_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
    console.log('🌱 Connecting to Turso database...');
    try {
        // Create all tables
        await client.executeMultiple(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id TEXT NOT NULL UNIQUE,
                name TEXT,
                username TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                created_at INTEGER DEFAULT (unixepoch())
            );
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
                goal TEXT,
                level TEXT,
                age INTEGER,
                weight INTEGER,
                phone TEXT,
                notifications INTEGER DEFAULT 1,
                onboarding_completed INTEGER DEFAULT 0,
                updated_at INTEGER DEFAULT (unixepoch())
            );
            CREATE TABLE IF NOT EXISTS programs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                duration_days INTEGER NOT NULL,
                price INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                program_id INTEGER NOT NULL REFERENCES programs(id),
                day_number INTEGER NOT NULL,
                title TEXT NOT NULL,
                video_url TEXT,
                description TEXT
            );
            CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                workout_id INTEGER NOT NULL REFERENCES workouts(id),
                completed INTEGER NOT NULL DEFAULT 0,
                completed_at INTEGER
            );
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                status TEXT NOT NULL,
                plan TEXT NOT NULL,
                expires_at INTEGER
            );
        `);
        console.log('✅ Tables created/verified.');

        // Clear existing data
        await client.executeMultiple(`
            DELETE FROM user_progress;
            DELETE FROM workouts;
            DELETE FROM programs;
        `);
        console.log('🧹 Cleared old data.');

        // ------ PROGRAM 1: Старт ------
        const startRes = await client.execute(
            `INSERT INTO programs (title, description, duration_days, price) VALUES (?, ?, ?, ?) RETURNING id`,
            ['Старт', '12 занятий для тех, кто только начинает. Освой азы, правильную технику и полюби движение без стресса.', 12, 150000]
        );
        const startId = startRes.rows[0].id as number;

        const startWorkouts: [number, string, string][] = [
            [1, 'Вводное занятие. Дыхание и осанка', 'Учимся правильно дышать и держать спину. 25 мин.'],
            [2, 'Активация глубоких мышц кора', 'Базовые упражнения на кор без скручиваний. 30 мин.'],
            [3, 'Подвижность суставов всего тела', 'Снимаем зажимы и улучшаем амплитуду движений. 30 мин.'],
            [4, 'Мягкий кор — без скуки', 'Продолжаем укреплять центр. 25 мин.'],
            [5, 'Нижняя часть тела: ягодицы и ноги', 'Лёгкие приседания и выпады без веса. 35 мин.'],
            [6, 'Верх тела: руки, спина, плечи', 'Активируем спину и улучшаем осанку. 30 мин.'],
            [7, 'Восстановление и стретчинг', 'Мягкая растяжка для снятия напряжения. 20 мин.'],
            [8, 'Кардио-активация (мягкая)', 'Разгоняем пульс для жиросжигания без прыжков. 30 мин.'],
            [9, 'Фуллбоди: всё тело в одной тренировке', 'Комплексная проработка всех мышечных групп. 40 мин.'],
            [10, 'Лёгкие ноги (антиотёк)', 'Специальная МФР-практика для лёгкости в ногах. 25 мин.'],
            [11, 'Пресс и бока: без скручиваний', 'Создаём талию безопасными упражнениями. 30 мин.'],
            [12, 'Финальная тренировка + растяжка', 'Закрепляем результат и подводим итоги курса. 40 мин.'],
        ];
        for (const [day, title, desc] of startWorkouts) {
            await client.execute(
                `INSERT INTO workouts (program_id, day_number, title, description) VALUES (?, ?, ?, ?)`,
                [startId, day, title, desc]
            );
        }
        console.log('✅ "Старт" seeded with 12 workouts.');

        // ------ PROGRAM 2: Продвинутый ------
        const advRes = await client.execute(
            `INSERT INTO programs (title, description, duration_days, price) VALUES (?, ?, ?, ?) RETURNING id`,
            ['Продвинутый', '21 домашняя тренировка + дополнительный блок для зала.', 21, 450000]
        );
        const advId = advRes.rows[0].id as number;

        const advWorkouts: [number, string, string][] = [
            [1, 'Фуллбоди активация', 'Разогрев и проработка всего тела. 35 мин.'],
            [2, 'Ягодицы: сила + памп', 'Акцент на форму и силу ягодичных мышц. 40 мин.'],
            [3, 'Нижняя часть: ноги полностью', 'Комплексная проработка ног. 40 мин.'],
            [4, 'Верх тела и спина', 'Укрепление мышц спины и рук. 35 мин.'],
            [5, 'Кор и пресс: продвинутый уровень', 'Интенсивная работа над прессом. 30 мин.'],
            [6, 'HIIT — сжигаем калории', 'Высокоинтенсивный интервальный тренинг. 35 мин.'],
            [7, 'Мобильность и гибкость', 'Растяжка и улучшение подвижности. 25 мин.'],
            [8, 'Ягодицы и бицепс бедра', 'Глубокая проработка задней цепи. 40 мин.'],
            [9, 'Плечи и руки', 'Красивые плечи и подтянутые руки. 35 мин.'],
            [10, 'Интервальное кардио', 'Жиросжигание и выносливость. 30 мин.'],
            [11, 'Пресс без скручиваний', 'Продвинутые техники для плоского живота. 30 мин.'],
            [12, 'Фуллбоди силовая', 'Все группы мышц с нагрузкой. 45 мин.'],
            [13, 'Ягодицы: финальный памп', 'Максимальная нагрузка на ягодицы. 40 мин.'],
            [14, 'Спина и осанка', 'Идеальная осанка и сильная спина. 35 мин.'],
            [15, 'Ноги: квадрицепсы и приводящие', 'Форма ног изнутри. 40 мин.'],
            [16, 'HIIT финал', 'Финальный жиросжигающий блок. 35 мин.'],
            [17, 'Йога и восстановление', 'Глубокое восстановление и баланс. 30 мин.'],
            [18, 'Кор 360°', 'Проработка кора со всех сторон. 35 мин.'],
            [19, 'Суперсет: ноги + ягодицы', 'Комбинированная нагрузка для нижней части. 45 мин.'],
            [20, 'Верх + кор', 'Руки, спина и пресс в одной тренировке. 40 мин.'],
            [21, 'Финальная тренировка', 'Всё тело, подводим итог программы. 50 мин.'],
        ];
        for (const [day, title, desc] of advWorkouts) {
            await client.execute(
                `INSERT INTO workouts (program_id, day_number, title, description) VALUES (?, ?, ?, ?)`,
                [advId, day, title, desc]
            );
        }
        console.log('✅ "Продвинутый" seeded with 21 workouts.');

        console.log('\n🎉 Seeding complete! Turso database is ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
