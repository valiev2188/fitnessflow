import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
    verifyCompleteSign,
    loadOrder,
    sendPaymentConfirmation,
    ERR_OK, ERR_SIGN, ERR_WRONG_AMOUNT, ERR_ALREADY_PAID, ERR_ORDER, ERR_PREPARE_ID,
} from '@/lib/click';
import { grantSubscription, redeemPromoCode } from '@/lib/subscription';

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

    // 1. Verify signature
    if (!verifyCompleteSign({
        click_trans_id, service_id, merchant_trans_id,
        merchant_prepare_id: String(merchant_prepare_id),
        amount, action: String(action), sign_time, sign_string,
    })) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_SIGN, error_note: 'Invalid sign' });
    }

    // 2. Load order
    const payment = await loadOrder(merchant_trans_id);
    if (!payment) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_ORDER, error_note: 'Order not found' });
    }

    // 3. Already paid? (idempotency)
    if (payment.status === 'paid') {
        return NextResponse.json({ click_trans_id, merchant_trans_id, merchant_confirm_id: payment.id, error: ERR_ALREADY_PAID, error_note: 'Already paid' });
    }

    // 4. Amount match
    if (Math.round(parseFloat(amount)) !== payment.finalAmount) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_WRONG_AMOUNT, error_note: 'Wrong amount' });
    }

    // 5. Prepare ID match
    if (payment.merchantPrepareId !== parseInt(String(merchant_prepare_id), 10)) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, merchant_confirm_id: null, error: ERR_PREPARE_ID, error_note: 'Prepare ID mismatch' });
    }

    // 6. User cancelled on Click side
    if (error !== 0 && error != null) {
        await db.update(payments).set({ status: 'failed' }).where(eq(payments.id, payment.id));
        return NextResponse.json({ click_trans_id, merchant_trans_id, merchant_confirm_id: payment.id, error: ERR_OK, error_note: 'Cancelled' });
    }

    // 7. Mark paid (do first — idempotency guard)
    await db.update(payments).set({
        status: 'paid',
        clickTransId: String(click_trans_id),
        paidAt: new Date(),
    }).where(eq(payments.id, payment.id));

    // 8. Grant subscription
    await grantSubscription(payment.userId, payment.plan);

    // 9. Redeem promo code if used
    if (payment.promoCodeId) {
        await redeemPromoCode(payment.promoCodeId, payment.userId);
    }

    // 10. Telegram notification (fire-and-forget)
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
