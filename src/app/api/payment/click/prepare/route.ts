import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
    verifyPrepareSign,
    loadOrder,
    ERR_OK, ERR_SIGN, ERR_WRONG_AMOUNT, ERR_ALREADY_PAID, ERR_ORDER,
} from '@/lib/click';

export async function POST(req: Request) {
    const body = await req.json();
    const {
        click_trans_id,
        service_id,
        merchant_trans_id,
        amount,
        action,
        sign_time,
        sign_string,
    } = body;

    // 1. Verify signature
    if (!verifyPrepareSign({ click_trans_id, service_id, merchant_trans_id, amount, action: String(action), sign_time, sign_string })) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_SIGN, error_note: 'Invalid sign' });
    }

    // 2. Load order
    const payment = await loadOrder(merchant_trans_id);
    if (!payment) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_ORDER, error_note: 'Order not found' });
    }

    // 3. Already paid?
    if (payment.status === 'paid') {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_ALREADY_PAID, error_note: 'Already paid' });
    }

    // 4. Amount match
    if (Math.round(parseFloat(amount)) !== payment.finalAmount) {
        return NextResponse.json({ click_trans_id, merchant_trans_id, error: ERR_WRONG_AMOUNT, error_note: 'Wrong amount' });
    }

    // 5. Save prepare ID
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
