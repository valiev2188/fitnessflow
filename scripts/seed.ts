import { db } from '../src/db/index';
import { programs, workouts } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Override env vars with the user's provided Turso URL
process.env.TURSO_DB_URL = 'libsql://turso-db-create-fitnessflow-abdulazizvaliev.aws-eu-west-1.turso.io';
process.env.TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMxODgyODUsImlkIjoiMDE5Y2RhM2ItODkwMS03YzRlLWJhODItNzhlMDNkMTc1ZjliIiwicmlkIjoiNjEwNGIwMTUtZGYzMi00YTQyLWE4OGItZDIwNDFkOWUwOWY4In0.F8PtUN9VDmXmTOxibL8bRMr-glPnoarbZ8hJSGU_9kbFwWK24olTWfWNx6nUdKBV-daalLcU5lpu4rM1OzLbBg';
process.env.DATABASE_URL = `${process.env.TURSO_DB_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`;

dotenv.config({ override: true });

async function seed() {
    console.log('🌱 Connecting to remote Turso database...');
    try {
        // Clear existing programs (this will cascade fail if not careful, but let's just delete the records)
        console.log('🧹 Clearing old workouts and programs...');
        await db.delete(workouts);
        await db.delete(programs);

        // -------------------------------------------------------
        // PROGRAM 1: Старт
        // -------------------------------------------------------
        const [startProgram] = await db.insert(programs).values({
            title: 'Старт',
            description: '12 занятий для тех, кто только начинает. Освой азы, правильную технику и полюби движение без стресса. Все тренировки проводятся дома — никакого инвентаря.',
            durationDays: 12,
            price: 150000, // in sum
        }).returning();

        const startWorkouts = [
            { day: 1, title: 'Вводное занятие. Дыхание и осанка', desc: 'Учимся правильно дышать и держать спину.' },
            { day: 2, title: 'Активация глубоких мышц кора', desc: 'Базовые упражнения на кор без скручиваний.' },
            { day: 3, title: 'Подвижность суставов всего тела', desc: 'Снимаем зажимы и улучшаем амплитуду движений.' },
            { day: 4, title: 'Мягкий кор — без скуки', desc: 'Продолжаем укреплять центр.' },
            { day: 5, title: 'Нижняя часть тела: ягодицы и ноги', desc: 'Лёгкие приседания и выпады без веса.' },
            { day: 6, title: 'Верх тела: руки, спина, плечи', desc: 'Активируем спину и улучшаем осанку.' },
            { day: 7, title: 'Восстановление и стретчинг', desc: 'Мягкая растяжка для снятия напряжения.' },
            { day: 8, title: 'Кардио-активация (мягкая)', desc: 'Разгоняем пульс для жиросжигания без прыжков.' },
            { day: 9, title: 'Фуллбоди: всё тело в одной тренировке', desc: 'Комплексная проработка всех мышечных групп.' },
            { day: 10, title: 'Лёгкие ноги (антиотёк)', desc: 'Специальная МФР-практика для легкости в ногах.' },
            { day: 11, title: 'Пресс и бока: без скручиваний', desc: 'Создаем талию безопасными упражнениями.' },
            { day: 12, title: 'Финальная тренировка + растяжка', desc: 'Закрепляем результат и подводим итоги курса.' },
        ];

        await db.insert(workouts).values(
            startWorkouts.map(w => ({
                programId: startProgram.id,
                dayNumber: w.day,
                title: w.title,
                description: w.desc,
                videoUrl: '',
            }))
        );
        console.log(`✅ Program "${startProgram.title}" seeded with 12 workouts.`);

        // -------------------------------------------------------
        // PROGRAM 2: Продвинутый (Только дома / основной)
        // -------------------------------------------------------
        const [advProgram] = await db.insert(programs).values({
            title: 'Продвинутый',
            description: 'Продвинутый модуль курса. Для тех, кто уже в теме и хочет настоящих результатов.',
            durationDays: 21,
            price: 450000, 
        }).returning();

        const advWorkouts = [
            { day: 1, title: 'Фуллбоди активация' },
            { day: 2, title: 'Ягодицы: сила + памп' },
            { day: 3, title: 'Нижняя часть: ноги полностью' },
            { day: 4, title: 'Верх тела и спина' },
            { day: 5, title: 'Кор и пресс: продвинутый уровень' },
            { day: 6, title: 'HIIT — сжигаем калории' },
            { day: 7, title: 'Мобильность и гибкость' },
            { day: 8, title: 'Ягодицы дома. Часть 2' },
        ];
        
        // Fill the rest with placeholders up to 21
        for (let i = 9; i <= 21; i++) {
            advWorkouts.push({ day: i, title: `Тренировка ${i}` });
        }

        await db.insert(workouts).values(
            advWorkouts.map(w => ({
                programId: advProgram.id,
                dayNumber: w.day,
                title: w.title,
                description: 'Домашняя продвинутая тренировка',
                videoUrl: '',
            }))
        );
        console.log(`✅ Program "${advProgram.title}" seeded with 21 workouts.`);

        console.log('\n🎉 Remote Seeding complete! Database is ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
