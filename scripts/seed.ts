import { db } from '../src/db/index';
import { programs, workouts } from '../src/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ override: true });

async function seed() {
    console.log('🌱 Connecting to database...');
    try {
        // Clear existing programs
        console.log('Sweep: 🧹 Clearing old workouts and programs...');
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
            { day: 1, title: 'Вводное занятие. Дыхание и осанка', desc: 'Учимся правильно дышать и держать спину. Продолжительность: 25 мин.' },
            { day: 2, title: 'Активация глубоких мышц кора', desc: 'Базовые упражнения на кор без скручиваний. Продолжительность: 30 мин.' },
            { day: 3, title: 'Подвижность суставов всего тела', desc: 'Снимаем зажимы и улучшаем амплитуду движений. Продолжительность: 30 мин.' },
            { day: 4, title: 'Мягкий кор — без скуки', desc: 'Продолжаем укреплять центр. Продолжительность: 25 мин.' },
            { day: 5, title: 'Нижняя часть тела: ягодицы и ноги', desc: 'Лёгкие приседания и выпады без веса. Продолжительность: 35 мин.' },
            { day: 6, title: 'Верх тела: руки, спина, плечи', desc: 'Активируем спину и улучшаем осанку. Продолжительность: 30 мин.' },
            { day: 7, title: 'Восстановление и стретчинг', desc: 'Мягкая растяжка для снятия напряжения. Продолжительность: 20 мин.' },
            { day: 8, title: 'Кардио-активация (мягкая)', desc: 'Разгоняем пульс для жиросжигания без прыжков. Продолжительность: 30 мин.' },
            { day: 9, title: 'Фуллбоди: всё тело в одной тренировке', desc: 'Комплексная проработка всех мышечных групп. Продолжительность: 35 мин.' },
            { day: 10, title: 'Лёгкие ноги (антиотёк)', desc: 'Специальная МФР-практика для легкости в ногах. Продолжительность: 25 мин.' },
            { day: 11, title: 'Пресс и бока: без скручиваний', desc: 'Создаем талию безопасными упражнениями. Продолжительность: 30 мин.' },
            { day: 12, title: 'Финальная тренировка + растяжка', desc: 'Закрепляем результат и подводим итоги курса. Продолжительность: 40 мин.' },
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
        // PROGRAM 2: Продвинутый
        // -------------------------------------------------------
        const [advProgram] = await db.insert(programs).values({
            title: 'Продвинутый',
            description: 'Продвинутый модуль курса для тех, кто уже в теме и хочет настоящих результатов. 21 домашняя тренировка + дополнительный блок для зала.',
            durationDays: 21,
            price: 450000, 
        }).returning();

        const advWorkouts = [
            { day: 1, title: 'Фуллбоди активация', desc: 'Разогрев и проработка всего тела. 35 мин.' },
            { day: 2, title: 'Ягодицы: сила + памп', desc: 'Акцент на форму и силу ягодичных мышц. 40 мин.' },
            { day: 3, title: 'Нижняя часть: ноги полностью', desc: 'Комплексная проработка ног. 40 мин.' },
            { day: 4, title: 'Верх тела и спина', desc: 'Укрепление мышц спины и рук. 35 мин.' },
            { day: 5, title: 'Кор и пресс: продвинутый уровень', desc: 'Интенсивная работа над прессом. 30 мин.' },
            { day: 6, title: 'HIIT — сжигаем калории', desc: 'Высокоинтенсивный интервальный тренинг. 25 мин.' },
            { day: 7, title: 'Мобильность и гибкость', desc: 'Растяжка и улучшение подвижности. 25 мин.' },
            { day: 8, title: 'Ягодицы дома. Часть 2', desc: 'Второй уровень проработки ягодиц. 40 мин.' },
        ];
        
        for (let i = 9; i <= 21; i++) {
            advWorkouts.push({ day: i, title: `Тренировка ${i}: Интенсив ${i-8}`, desc: 'Продвинутая домашняя тренировка. 35-45 мин.' });
        }

        await db.insert(workouts).values(
            advWorkouts.map(w => ({
                programId: advProgram.id,
                dayNumber: w.day,
                title: w.title,
                description: w.desc || 'Домашняя продвинутая тренировка',
                videoUrl: '',
            }))
        );
        console.log(`✅ Program "${advProgram.title}" seeded with 21 workouts.`);

        console.log('\n🎉 Seeding complete! Database is ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
