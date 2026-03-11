import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBAPP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fitnessflow-tau.vercel.app';
const HUMO_CARD = '8600030457183980';
const RECEIVER_NAME = 'Лола Р.';

// Send a message via Telegram Bot API
async function sendMessage(chatId: number | string, text: string, extra: any = {}) {
    const body = { chat_id: chatId, text, parse_mode: 'HTML', ...extra };
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

// Main keyboard shown at bottom of chat
const mainKeyboard = {
    keyboard: [
        [{ text: '🏋️ Открыть тренировки' }, { text: '💳 Как оплатить?' }],
        [{ text: '📊 Мой статус' }, { text: '📞 Написать тренеру' }],
    ],
    resize_keyboard: true,
    persistent: true,
};

// Handle /start command
async function handleStart(chatId: number, firstName: string, telegramId: string) {
    const text =
        `👋 Привет, <b>${firstName}</b>! Я бот Лолы — дипломированного тренера с опытом ` +
        `работы в лучших студиях.\n\n` +
        `✨ <b>Что я умею:</b>\n` +
        `🎁 Дать доступ к <b>бесплатному</b> 3-дневному курсу\n` +
        `🌟 Помочь купить <b>21-дневный курс Трансформации</b>\n` +
        `📊 Показать ваш статус подписки\n\n` +
        `Открой мини-приложение ниже чтобы начать тренировки! 💪`;

    await sendMessage(chatId, text, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏋️ Открыть курсы', web_app: { url: `${WEBAPP_URL}/dashboard/programs` } }],
                [{ text: '🌟 Купить 21 день ($40)', callback_data: 'buy_course' }],
                [{ text: '💬 Написать тренеру', url: 'https://t.me/vvveins' }],
            ],
        },
    });

    // Also show persistent keyboard
    await sendMessage(chatId, '👇 Используй кнопки ниже для навигации:', {
        reply_markup: mainKeyboard,
    });
}

// Handle /pay or "Как оплатить?"
async function handlePay(chatId: number) {
    const text =
        `💳 <b>Оплата курса</b>\n\n` +
        `<b>Выберите тариф:</b>\n` +
        `├ 🌱 <b>Лёгкий старт</b> (21 день) — <b>$40</b>\n` +
        `├ 🔥 <b>Продвинутый</b> (групповой чат) — <b>$80</b>\n` +
        `└ 👑 <b>Индивидуальный</b> (2 офлайн встречи) — <b>$200</b>\n\n` +
        `<b>Реквизиты Humo:</b>\n` +
        `<code>${HUMO_CARD}</code>\n` +
        `Получатель: ${RECEIVER_NAME}\n\n` +
        `После оплаты — отправьте скриншот чека сюда или @vvveins.`;

    await sendMessage(chatId, text, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📋 Скопировать номер карты', callback_data: 'copy_card' }],
                [{ text: '📸 Отправить чек администратору', url: 'https://t.me/vvveins?text=Здравствуйте%2C+оплатила+курс.+Прикрепляю+чек:' }],
            ],
        },
    });
}

// Handle /status or "Мой статус"
async function handleStatus(chatId: number, telegramId: string) {
    const user = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1).then(r => r[0]);

    if (!user) {
        await sendMessage(chatId,
            `❌ Вы ещё не зарегистрированы.\n\nОткройте мини-приложение, чтобы начать!`,
            { reply_markup: { inline_keyboard: [[{ text: '🏋️ Открыть приложение', web_app: { url: WEBAPP_URL } }]] } }
        );
        return;
    }

    const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1).then(r => r[0]);

    let statusText: string;
    if (user.role === 'admin') {
        statusText = '👑 <b>Администратор</b> — полный доступ ко всем курсам';
    } else if (sub && sub.status === 'active' && new Date(sub.expiresAt!) > new Date()) {
        const expiry = new Date(sub.expiresAt!).toLocaleDateString('ru-RU');
        statusText = `✅ <b>Подписка активна</b>\nТариф: ${sub.plan || 'Стандарт'}\nДо: ${expiry}`;
    } else {
        statusText = `⏳ <b>Нет активной подписки</b>\n\nБесплатный демо-курс (3 дня) доступен всем!`;
    }

    await sendMessage(chatId,
        `📊 <b>Ваш статус</b>\n\n👤 ${user.name} (@${user.username || 'без username'})\n${statusText}`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏋️ Открыть тренировки', web_app: { url: `${WEBAPP_URL}/dashboard/programs` } }],
                    sub ? [] : [{ text: '💳 Купить курс', callback_data: 'buy_course' }],
                ].filter(row => row.length > 0),
            },
        }
    );
}

// Handle /contact or "Написать тренеру"
async function handleContact(chatId: number) {
    await sendMessage(chatId,
        `📞 <b>Связаться с тренером</b>\n\n` +
        `По всем вопросам обращайтесь напрямую к Лоле:\n` +
        `👉 @vvveins\n\n` +
        `<i>Обычно отвечаю в течение нескольких часов.</i>`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💬 Написать @vvveins', url: 'https://t.me/vvveins' }],
                ],
            },
        }
    );
}

// Handle /help
async function handleHelp(chatId: number) {
    await sendMessage(chatId,
        `📖 <b>Список команд:</b>\n\n` +
        `/start — Главное меню\n` +
        `/pay — Реквизиты для оплаты\n` +
        `/status — Мой статус подписки\n` +
        `/contact — Написать тренеру\n` +
        `/help — Эта справка\n\n` +
        `Или используй кнопки внизу! 👇`,
        { reply_markup: mainKeyboard }
    );
}

export async function POST(req: Request) {
    try {
        const update = await req.json();
        const msg = update.message || update.callback_query?.message;
        const callbackQuery = update.callback_query;

        if (!msg) return NextResponse.json({ ok: true });

        const chatId = msg.chat.id;
        const telegramId = (msg.from?.id || callbackQuery?.from?.id)?.toString();
        const firstName = msg.from?.first_name || callbackQuery?.from?.first_name || 'друг';
        const text = msg.text || '';

        // Handle callback queries (inline button presses)
        if (callbackQuery) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: callbackQuery.id }),
            });

            if (callbackQuery.data === 'buy_course') {
                await handlePay(chatId);
            } else if (callbackQuery.data === 'copy_card') {
                await sendMessage(chatId, `<code>${HUMO_CARD}</code>\n\nНажмите на номер чтобы скопировать! 👆`);
            }
            return NextResponse.json({ ok: true });
        }

        // Handle text commands and keyboard buttons
        if (text === '/start' || text.startsWith('/start ')) {
            await handleStart(chatId, firstName, telegramId || '');
        } else if (text === '/pay' || text === '💳 Как оплатить?') {
            await handlePay(chatId);
        } else if (text === '/status' || text === '📊 Мой статус') {
            await handleStatus(chatId, telegramId || '');
        } else if (text === '/contact' || text === '📞 Написать тренеру') {
            await handleContact(chatId);
        } else if (text === '/help') {
            await handleHelp(chatId);
        } else if (text === '🏋️ Открыть тренировки') {
            await sendMessage(chatId, '💪 Нажми кнопку ниже чтобы открыть тренировки:', {
                reply_markup: {
                    inline_keyboard: [[{ text: '🏋️ Открыть курсы', web_app: { url: `${WEBAPP_URL}/dashboard/programs` } }]],
                },
            });
        } else {
            // Unknown message — show main menu
            await sendMessage(chatId,
                `Не понял тебя 🤔 Воспользуйся кнопками ниже или отправь /help`,
                { reply_markup: mainKeyboard }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Bot webhook error:', error);
        return NextResponse.json({ ok: true }); // Always return 200 to Telegram
    }
}
