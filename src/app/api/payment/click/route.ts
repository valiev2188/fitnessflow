import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { grantSubscription, redeemPromoCode } from '@/lib/subscription';

const SECRET_KEY = process.env.CLICK_SECRET_KEY!;

// Click error codes
const ERR_OK           =  0;
const ERR_SIGN         = -1;
const ERR_WRONG_AMOUNT = -2;
const ERR_ALREADY_PAID = -4;
const ERR_ORDER        = -5;
const ERR_PREPARE_ID   = -6;

function md5Sign(parts: string[]): string {
    return crypto.createHash('md5').update(parts.join('')).digest('hex');
}

export async function POST(req: Request) {
    const body = await req.json();
    const {
        click_trans_id,
        service_id,
        merchant_trans_id,
        merchant_prepare_id,
        amount,
        action,
        sign_time,
        sign_string,
        error,
    } = body;

    // --- Signature verification ---
    const signParts =
        action === 1
            ? [click_trans_id, service_id, SECRET_KEY, merchant_trans_id, String(merchant_prepare_id), amount, String(action), sign_time]
            : [click_trans_id, service_id, SECRET_KEY, merchant_trans_id, amount, String(action), sign_time];

    if (md5Sign(signParts) !== sign_string) {
        return NextResponse.json({
            click_trans_id,
            merchant_trans_id,
            error: ERR_SIGN,
            error_note: 'Invalid sign',
        });
    }

    // --- Load order ---
    const orderId = parseInt(merchant_trans_id, 10);
    const payment = await db.select().from(payments)
        .where(eq(payments.id, orderId))
        .limit(1).then(r => r[0]);

    if (!payment) {
        return NextResponse.json({
            click_trans_id,
            merchant_trans_id,
            error: ERR_ORDER,
            error_note: 'Order not found',
        });
    }

    if (payment.status === 'paid') {
        return NextResponse.json({
            click_trans_id,
            merchant_trans_id,
            error: ERR_ALREADY_PAID,
            error_note: 'Already paid',
        });
    }

    // Amount check
    const clickAmount = Math.round(parseFloat(amount));
    if (clickAmount !== payment.finalAmount) {
        return NextResponse.json({
            click_trans_id,
            merchant_trans_id,
            error: ERR_WRONG_AMOUNT,
            error_note: 'Wrong amount',
        });
    }

    // ─── ACTION 0: PREPARE ───────────────────────────────────────────
    if (action === 0) {
        await db.update(payments)
            .set({ merchantPrepareId: payment.id })
            .where(eq(payments.id, payment.id));

        return NextResponse.json({
            click_trans_id,
            merchant_trans_id,
            merchant_prepare_id: payment.id,
            error: ERR_OK,
            error_note: 'Success',
        });
    }

    // ─── ACTION 1: COMPLETE ──────────────────────────────────────────
    if (action === 1) {
        if (payment.merchantPrepareId !== parseInt(String(merchant_prepare_id), 10)) {
            return NextResponse.json({
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: null,
                error: ERR_PREPARE_ID,
                error_note: 'Prepare ID mismatch',
            });
        }

        // User cancelled / Click-side error
        if (error !== 0 && error != null) {
            await db.update(payments)
                .set({ status: 'failed' })
                .where(eq(payments.id, payment.id));

            return NextResponse.json({
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: payment.id,
                error: ERR_OK,
                error_note: 'Cancelled',
            });
        }

        // Mark paid first (idempotency guard)
        await db.update(payments).set({
            status: 'paid',
            clickTransId: String(click_trans_id),
            paidAt: new Date(),
        }).where(eq(payments.id, payment.id));

        // Grant subscription
        await grantSubscription(payment.userId, payment.plan);

        // Redeem promo code if applied
        if (payment.promoCodeId) {
            await redeemPromoCode(payment.promoCodeId, payment.userId);
        }

        // Telegram notification (fire-and-forget)
        sendPaymentConfirmation(payment.userId, payment.plan, payment.finalAmount)
            .catch(e => console.error('TG notification failed:', e));

        return NextResponse.json({
            click_trans_id,
            merchant_trans_id,
            merchant_confirm_id: payment.id,
            error: ERR_OK,
            error_note: 'Success',
        });
    }

    return NextResponse.json({ error: -9, error_note: 'Unknown action' });
}

async function sendPaymentConfirmation(userId: number, plan: string, amount: number) {
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
                    { text: '🏋️ Начать тренировки', web_app: { url: `${WEBAPP_URL}/dashboard` } },
                ]],
            },
        }),
    });
}
