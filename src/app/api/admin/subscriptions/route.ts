import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

// Helper to authenticate admin
async function getAdminUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1).then(res => res[0]);
        if (user && user.role === 'admin') {
            return user;
        }
    } catch (e) {
        return null;
    }
    return null;
}

export async function POST(req: Request) {
    try {
        const adminUser = await getAdminUser(req);
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { userId, plan, status, days = 30 } = body;

        if (!userId || !plan || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(days));

        // Check if subscription exists
        const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1).then(res => res[0]);

        if (existingSub) {
            // Update
            await db.update(subscriptions)
                .set({ plan, status, expiresAt })
                .where(eq(subscriptions.id, existingSub.id));
        } else {
            // Create
            await db.insert(subscriptions).values({
                userId,
                plan,
                status,
                expiresAt
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
