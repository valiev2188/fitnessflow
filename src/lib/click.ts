import crypto from 'crypto';
import { db } from '@/db';
import { payments, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SECRET_KEY = process.env.CLICK_SECRET_KEY!;

// ─── Error codes ────────────────────────────────────────────────────────────
export const ERR_OK           =  0;
export const ERR_SIGN         = -1;
export const ERR_WRONG_AMOUNT = -2;
export const ERR_ALREADY_PAID = -4;
export const ERR_ORDER        = -5;
export const ERR_PREPARE_ID   = -6;

// ─── Signature ───────────────────────────────────────────────────────────────
export function md5Sign(parts: string[]): string {
    return crypto.createHash('md5').update(parts.join('')).digest('hex');
}

/** Verify prepare (action=0) signature */
export function verifyPrepareSign(p: {
    click_trans_id: string;
    service_id: string;
    merchant_trans_id: string;
    amount: string;
    action: string;
    sign_time: string;
    sign_string: string;
}): boolean {
    const expected = md5Sign([
        p.click_trans_id, p.service_id, SECRET_KEY,
        p.merchant_trans_id, p.amount, p.action, p.sign_time,
    ]);
    return expected === p.sign_string;
}

/** Verify complete (action=1) signature — includes merchant_prepare_id */
export function verifyCompleteSign(p: {
    click_trans_id: string;
    service_id: string;
    merchant_trans_id: string;
    merchant_prepare_id: string;
    amount: string;
    action: string;
    sign_time: string;
    sign_string: string;
}): boolean {
    const expected = md5Sign([
        p.click_trans_id, p.service_id, SECRET_KEY,
        p.merchant_trans_id, p.merchant_prepare_id,
        p.amount, p.action, p.sign_time,
    ]);
    return expected === p.sign_string;
}

// ─── Load & basic validate order ─────────────────────────────────────────────
export async function loadOrder(merchantTransId: string) {
    const orderId = parseInt(merchantTransId, 10);
    return db.select().from(payments)
        .where(eq(payments.id, orderId))
        .limit(1).then(r => r[0] ?? null);
}

// ─── Telegram notification ───────────────────────────────────────────────────
export async function sendPaymentConfirmation(userId: number, plan: string, amount: number) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) return;

    const user = await db.select({ telegramId: users.telegramId })
        .from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);
    if (!user?.telegramId) return;

    const amountStr = amount.toLocaleString('ru-RU') + ' сум';
    const WEBAPP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fitnessflow-tau.vercel.app';

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: user.telegramId,
            text:
                `✅ <b>Оплата подтверждена!</b>\n\n` +
                `Тариф: <b>${plan}</b>\n` +
                `Сумма: ${amountStr}\n\n` +
                `Доступ к тренировкам открыт. Нажмите кнопку ниже, чтобы начать!`,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🏋️ Начать тренировки', web_app: { url: `${WEBAPP_URL}/dashboard/programs` } },
                ]],
            },
        }),
    });
}
