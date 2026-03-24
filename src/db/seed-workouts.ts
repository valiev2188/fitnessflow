import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { programs, workouts } from './schema';
import { eq } from 'drizzle-orm';

const client = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

const WORKOUTS_DATA = [
    { day: 1,  title: 'Вводное занятие. Дыхание и осанка',      description: 'Учимся правильно дышать и держать спину. 25 мин.' },
    { day: 2,  title: 'Активация глубоких мышц кора',           description: 'Базовые упражнения на кор без скручиваний. 30 мин.' },
    { day: 3,  title: 'Подвижность суставов всего тела',        description: 'Снимаем зажимы и улучшаем амплитуду движений. 30 мин.' },
    { day: 4,  title: 'Мягкий кор — без скуки',                 description: 'Продолжаем укреплять центр. 25 мин.' },
    { day: 5,  title: 'Нижняя часть тела: ягодицы и ноги',      description: 'Лёгкие приседания и выпады без веса. 35 мин.' },
    { day: 6,  title: 'Верхняя часть тела и плечи',             description: 'Раскрытие груди, укрепление рук. 30 мин.' },
    { day: 7,  title: 'День восстановления: стретчинг',         description: 'Растяжка всего тела, расслабление. 25 мин.' },
    { day: 8,  title: 'Кардио без прыжков',                     description: 'Ходьба на месте, марш, боковые шаги. 30 мин.' },
    { day: 9,  title: 'Пресс и поясница',                       description: 'Укрепляем поясничный отдел безопасно. 30 мин.' },
    { day: 10, title: 'Ягодицы и бёдра',                        description: 'Работа с приводящими мышцами. 35 мин.' },
    { day: 11, title: 'Баланс и координация',                   description: 'Упражнения на одной ноге, устойчивость. 30 мин.' },
    { day: 12, title: 'Комплекс на всё тело',                   description: 'Соединяем всё изученное. 35 мин.' },
    { day: 13, title: 'Плечи и руки: лёгкий тонус',            description: 'Отжимания от стены, упражнения на трицепс. 30 мин.' },
    { day: 14, title: 'День активного отдыха',                  description: 'Лёгкая прогулка и дыхательные практики. 20 мин.' },
    { day: 15, title: 'Пресс: уровень 2',                       description: 'Планка, боковые скручивания. 30 мин.' },
    { day: 16, title: 'Нижняя часть тела: уровень 2',           description: 'Пульсирующие приседания, мостик. 35 мин.' },
    { day: 17, title: 'Кардио + кор',                           description: 'Чередование кардио-серий и упражнений на кор. 35 мин.' },
    { day: 18, title: 'Стретчинг глубокий',                     description: 'Работа с тазобедренным суставом и позвоночником. 25 мин.' },
    { day: 19, title: 'Полный комплекс: нижний акцент',         description: 'Ягодицы, бёдра, пресс. 40 мин.' },
    { day: 20, title: 'Полный комплекс: верхний акцент',        description: 'Руки, плечи, спина. 40 мин.' },
    { day: 21, title: 'Финальная тренировка',                   description: 'Всё тело — завершение курса «Старт». 40 мин.' },
];

async function seed() {
    // Find the "Старт" program
    const startProgram = await db.select().from(programs).where(eq(programs.title, 'Старт')).limit(1).then(r => r[0]);

    if (!startProgram) {
        console.error('Program "Старт" not found. Check the title in the DB.');
        process.exit(1);
    }

    console.log(`Found program: "${startProgram.title}" (id=${startProgram.id})`);

    // Update duration_days to 21
    await db.update(programs).set({ durationDays: 21 }).where(eq(programs.id, startProgram.id));
    console.log('Updated duration_days → 21');

    // Delete existing workouts for this program
    await db.delete(workouts).where(eq(workouts.programId, startProgram.id));
    console.log('Deleted existing workouts');

    // Insert all 21 workouts
    await db.insert(workouts).values(
        WORKOUTS_DATA.map(w => ({
            programId: startProgram.id,
            dayNumber: w.day,
            title: w.title,
            description: w.description,
            videoUrl: null,
        }))
    );

    console.log(`Inserted 21 workouts for "${startProgram.title}"`);
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
