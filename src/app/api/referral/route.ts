import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { referrals, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureReferralCode } from '@/lib/referral';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';
const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || 'testfref_bot';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number; telegramId: string };
        const { userId, telegramId } = decoded;

        const code = await ensureReferralCode(userId, telegramId);
        const referralLink = `https://t.me/${BOT_USERNAME}?start=ref_${code}`;

        const myReferrals = await db
            .select({
                id: referrals.id,
                status: referrals.status,
                createdAt: referrals.createdAt,
            })
            .from(referrals)
            .where(eq(referrals.referrerId, userId));

        const registeredCount = myReferrals.filter(r => r.status === 'registered' || r.status === 'purchased').length;
        const purchasedCount = myReferrals.filter(r => r.status === 'purchased').length;

        return NextResponse.json({
            code,
            referralLink,
            registeredCount,
            purchasedCount,
        });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
