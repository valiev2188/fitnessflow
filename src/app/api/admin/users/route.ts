import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

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

export async function GET(req: Request) {
    try {
        const adminUser = await getAdminUser(req);
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        const allSubs = await db.select().from(subscriptions);

        const usersWithSubs = allUsers.map(user => {
            const sub = allSubs.find(s => s.userId === user.id);
            return {
                ...user,
                subscription: sub || null
            };
        });

        return NextResponse.json(usersWithSubs);
    } catch (error) {
        console.error('Fetch Admin Users Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
