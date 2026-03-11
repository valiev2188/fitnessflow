import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles, userProgress, subscriptions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId: string, text: string, extra: any = {}) {
    if (!BOT_TOKEN) return;
    const body = { chat_id: chatId, text, parse_mode: 'HTML', ...extra };
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export async function GET(req: Request) {
    // Only allow Vercel Cron or manual admin trigger (with secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !req.headers.has('x-vercel-cron')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all profiles that have notifications enabled
        const profiles = await db.select({
            userId: userProfiles.userId,
            telegramId: users.telegramId,
            name: users.name,
        })
            .from(userProfiles)
            .innerJoin(users, eq(users.id, userProfiles.userId))
            .where(eq(userProfiles.notifications, true));

        const today = new Date();
        let sentCount = 0;

        for (const p of profiles) {
            // Check their progress
            const progress = await db.select().from(userProgress)
                .where(and(eq(userProgress.userId, p.userId), eq(userProgress.completed, true)))
                .orderBy(desc(userProgress.completedAt));

            // Check subscriptions
            const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, p.userId)).limit(1).then(r => r[0]);
            const hasActiveSub = sub && sub.status === 'active' && new Date(sub.expiresAt!) > today;

            if (progress.length === 0) continue; // Hasn't started yet

            const lastWorkoutDate = new Date(progress[0].completedAt!);
            const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 3600 * 24));

            // LOGIC 1: Missed 2 days
            if (daysSinceLastWorkout === 2) {
                await sendMessage(p.telegramId, `🌸 Привет, ${p.name}! Мы скучаем!\n\nДаже 10 минут активности сегодня — это уже победа. Возвращайся к тренировкам когда будешь готова 💪`);
                sentCount++;
            }

            // LOGIC 2: Finished Demo but no purchase (Assuming demo is 3 workouts)
            if (progress.length === 3 && daysSinceLastWorkout === 1 && !hasActiveSub) {
                await sendMessage(
                    p.telegramId,
                    `🎉 <b>Ты прошла демо-курс!</b>\n\nКак ощущения?\nТы сделала первый шаг к фигуре мечты. Не останавливайся на достигнутом!\n\nПолучи полный доступ к 21-дневному курсу трансформации всего за <b>$40</b>.`,
                    {
                        reply_markup: {
                            inline_keyboard: [[{ text: '💳 Купить полный курс', callback_data: 'buy_course' }]]
                        }
                    }
                );
                sentCount++;
            }

            // Await to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return NextResponse.json({ ok: true, sent: sentCount });

    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
