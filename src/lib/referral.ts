import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

function toBase36(n: number): string {
    return n.toString(36).toUpperCase();
}

export function generateReferralCode(telegramId: string): string {
    // Compact alphanumeric code based on telegramId
    const num = parseInt(telegramId, 10) || Math.floor(Math.random() * 1e9);
    const code = toBase36(num % 2176782336); // mod 36^6 → max 6 chars
    return code.padStart(6, '0');
}

export async function ensureReferralCode(userId: number, telegramId: string): Promise<string> {
    const [user] = await db.select({ referralCode: users.referralCode }).from(users).where(eq(users.id, userId)).limit(1);

    if (user?.referralCode) return user.referralCode;

    const code = generateReferralCode(telegramId);
    await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
    return code;
}
