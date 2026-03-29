import { db } from '@/db';
import { userPoints, pointTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export type PointTransactionType =
    | 'workout_complete'
    | 'course_complete'
    | 'referral_signup'
    | 'referral_purchase'
    | 'admin_grant';

export async function awardPoints(
    userId: number,
    amount: number,
    type: PointTransactionType,
    description: string,
    relatedId?: number
) {
    // Upsert balance
    await db
        .insert(userPoints)
        .values({ userId, balance: amount })
        .onConflictDoUpdate({
            target: userPoints.userId,
            set: {
                balance: sql`${userPoints.balance} + ${amount}`,
                updatedAt: sql`(unixepoch())`,
            },
        });

    // Insert transaction record
    await db.insert(pointTransactions).values({
        userId,
        amount,
        type,
        description,
        relatedId: relatedId ?? null,
    });
}

export async function getUserPoints(userId: number) {
    const [points, transactions] = await Promise.all([
        db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1),
        db
            .select()
            .from(pointTransactions)
            .where(eq(pointTransactions.userId, userId))
            .orderBy(desc(pointTransactions.createdAt))
            .limit(20),
    ]);

    return {
        balance: points[0]?.balance ?? 0,
        transactions,
    };
}
