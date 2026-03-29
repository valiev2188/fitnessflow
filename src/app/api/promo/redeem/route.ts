import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { promoCodes, promoCodeUsages } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number };
        const { code, plan } = await req.json();

        if (!code || !plan) {
            return NextResponse.json({ error: 'Missing code or plan' }, { status: 400 });
        }

        const promo = await db
            .select()
            .from(promoCodes)
            .where(eq(promoCodes.code, code.toUpperCase()))
            .limit(1)
            .then(r => r[0]);

        if (!promo || !promo.isActive) {
            return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
        }

        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Promo code expired' }, { status: 400 });
        }

        if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
            return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
        }

        if (promo.applicablePlan && promo.applicablePlan !== plan) {
            return NextResponse.json({ error: 'Promo code not applicable for this plan' }, { status: 400 });
        }

        const alreadyUsed = await db
            .select()
            .from(promoCodeUsages)
            .where(and(eq(promoCodeUsages.promoCodeId, promo.id), eq(promoCodeUsages.userId, userId)))
            .limit(1)
            .then(r => r[0]);

        if (alreadyUsed) {
            return NextResponse.json({ error: 'Already used this promo code' }, { status: 400 });
        }

        // Record usage and increment counter
        await db.insert(promoCodeUsages).values({ promoCodeId: promo.id, userId });
        await db
            .update(promoCodes)
            .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
            .where(eq(promoCodes.id, promo.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Promo redeem error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
