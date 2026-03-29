import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { promoCodes, promoCodeUsages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

// Plan prices in сум
const PLAN_PRICES: Record<string, number> = {
    'Старт': 150000,
    'Продвинутый': 450000,
    'VIP': 450000,
    'Питание': 150000,
};

export async function POST(req: Request) {
    try {
        const { code, plan } = await req.json();

        if (!code || !plan) {
            return NextResponse.json({ valid: false, message: 'Укажите промокод и тариф' }, { status: 400 });
        }

        // Get optional userId from token
        let userId: number | null = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number };
                userId = decoded.userId;
            } catch {}
        }

        const promo = await db
            .select()
            .from(promoCodes)
            .where(eq(promoCodes.code, code.toUpperCase()))
            .limit(1)
            .then(r => r[0]);

        if (!promo) {
            return NextResponse.json({ valid: false, message: 'Промокод не найден' });
        }

        if (!promo.isActive) {
            return NextResponse.json({ valid: false, message: 'Промокод неактивен' });
        }

        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return NextResponse.json({ valid: false, message: 'Срок действия промокода истёк' });
        }

        if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
            return NextResponse.json({ valid: false, message: 'Промокод исчерпал лимит использований' });
        }

        if (promo.applicablePlan && promo.applicablePlan !== plan) {
            return NextResponse.json({ valid: false, message: `Промокод действует только для тарифа "${promo.applicablePlan}"` });
        }

        // Check per-user usage
        if (userId) {
            const alreadyUsed = await db
                .select()
                .from(promoCodeUsages)
                .where(and(eq(promoCodeUsages.promoCodeId, promo.id), eq(promoCodeUsages.userId, userId)))
                .limit(1)
                .then(r => r[0]);

            if (alreadyUsed) {
                return NextResponse.json({ valid: false, message: 'Вы уже использовали этот промокод' });
            }
        }

        const originalPrice = PLAN_PRICES[plan] ?? 0;
        const discountedPrice = promo.discountType === 'percent'
            ? Math.round(originalPrice * (1 - promo.discountValue / 100))
            : Math.max(0, originalPrice - promo.discountValue);

        return NextResponse.json({
            valid: true,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            originalPrice,
            discountedPrice,
            promoId: promo.id,
        });
    } catch (error) {
        console.error('Promo validate error:', error);
        return NextResponse.json({ valid: false, message: 'Ошибка проверки промокода' }, { status: 500 });
    }
}
