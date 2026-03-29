import { db } from '@/db';
import { subscriptions, referrals, promoCodes, promoCodeUsages } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { awardPoints } from '@/lib/points';

const PLAN_DAYS: Record<string, number> = {
    'Старт': 30,
    'Продвинутый': 30,
};

export async function grantSubscription(userId: number, plan: string) {
    const days = PLAN_DAYS[plan] ?? 30;
    const expiresAt = new Date(Date.now() + days * 86_400_000);

    const existing = await db.select().from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.plan, plan)))
        .limit(1).then(r => r[0]);

    if (existing) {
        await db.update(subscriptions)
            .set({ status: 'active', expiresAt })
            .where(eq(subscriptions.id, existing.id));
    } else {
        await db.insert(subscriptions).values({ userId, plan, status: 'active', expiresAt });
    }

    // Referral purchase bonus
    const referral = await db.select().from(referrals)
        .where(and(eq(referrals.referredUserId, userId), eq(referrals.status, 'registered')))
        .limit(1).then(r => r[0]);

    if (referral) {
        await db.update(referrals)
            .set({ status: 'purchased' })
            .where(eq(referrals.id, referral.id));

        await awardPoints(
            referral.referrerId,
            300,
            'referral_purchase',
            'Подруга, которую вы пригласили, купила курс!',
            referral.id,
        );
    }
}

export async function redeemPromoCode(promoCodeId: number, userId: number) {
    await db.insert(promoCodeUsages).values({ promoCodeId, userId });
    await db.update(promoCodes)
        .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
        .where(eq(promoCodes.id, promoCodeId));
}
