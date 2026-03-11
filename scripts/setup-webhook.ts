// Script to register the Telegram bot webhook with Telegram servers
// Run: npx tsx scripts/setup-webhook.ts
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || 'https://fitnessflow-tau.vercel.app';

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set');
    process.exit(1);
}

async function setupWebhook() {
    console.log(`🔧 Setting webhook to: ${WEBHOOK_URL}/api/bot`);

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: `${WEBHOOK_URL}/api/bot`,
            allowed_updates: ['message', 'callback_query'],
        }),
    });

    const data = await res.json();

    if (data.ok) {
        console.log('✅ Webhook registered successfully!');
    } else {
        console.error('❌ Failed to set webhook:', data);
    }

    // Set bot commands (shown in menu)
    const cmdRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            commands: [
                { command: 'start', description: '🏠 Главное меню' },
                { command: 'pay', description: '💳 Реквизиты для оплаты' },
                { command: 'status', description: '📊 Мой статус подписки' },
                { command: 'contact', description: '📞 Написать тренеру' },
                { command: 'help', description: '📖 Список команд' },
            ],
        }),
    });

    const cmdData = await cmdRes.json();
    if (cmdData.ok) {
        console.log('✅ Bot commands registered!');
    } else {
        console.error('❌ Failed to set commands:', cmdData);
    }
}

setupWebhook();
