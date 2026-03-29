import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/db';
import { payments, promoCodes, promoCodeUsages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const PLAN_PRICES: Record<string, number> = {
    'Старт': 150000,
    'Продвинутый': 450000,
};

export async function POST(req: Request) {
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, promoCode } = await req.json();

    const basePrice = PLAN_PRICES[plan];
    if (!basePrice) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    let finalAmount = basePrice;
    let resolvedPromoId: number | null = null;
    let resolvedPromoCode: string | null = null;

    if (promoCode) {
        const code = (promoCode as string).toUpperCase().trim();
        const promo = await db.select().from(promoCodes)
            .where(eq(promoCodes.code, code))
            .limit(1).then(r => r[0]);

        if (
            promo &&
            promo.isActive &&
            (!promo.expiresAt || new Date(promo.expiresAt) >= new Date()) &&
            (promo.maxUses === null || promo.usedCount < promo.maxUses) &&
            (!promo.applicablePlan || promo.applicablePlan === plan)
        ) {
            const alreadyUsed = await db.select().from(promoCodeUsages)
                .where(and(
                    eq(promoCodeUsages.promoCodeId, promo.id),
                    eq(promoCodeUsages.userId, user.id),
                ))
                .limit(1).then(r => r[0]);

            if (!alreadyUsed) {
                finalAmount = promo.discountType === 'percent'
                    ? Math.round(basePrice * (1 - promo.discountValue / 100))
                    : Math.max(0, basePrice - promo.discountValue);
                resolvedPromoId = promo.id;
                resolvedPromoCode = code;
            }
        }
    }

    const [payment] = await db.insert(payments).values({
        userId: user.id,
        plan,
        amount: basePrice,
        finalAmount,
        status: 'pending',
        promoCode: resolvedPromoCode,
        promoCodeId: resolvedPromoId,
    }).returning();

    const SERVICE_ID = process.env.CLICK_SERVICE_ID!;
    const MERCHANT_ID = process.env.CLICK_MERCHANT_ID!;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fitnessflow-tau.vercel.app';
    const returnUrl = encodeURIComponent(`${APP_URL}/payment/success?orderId=${payment.id}`);

    const clickUrl =
        `https://my.click.uz/services/pay` +
        `?service_id=${SERVICE_ID}` +
        `&merchant_id=${MERCHANT_ID}` +
        `&amount=${finalAmount}` +
        `&transaction_param=${payment.id}` +
        `&return_url=${returnUrl}`;

    return NextResponse.json({ orderId: payment.id, clickUrl });
}
