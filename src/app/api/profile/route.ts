import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

function getUserId(req: Request): number | null {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    try {
        const decoded = jwt.verify(auth.substring(7), JWT_SECRET) as { userId: number };
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1).then(r => r[0]);
    return NextResponse.json({ profile: profile || null });
}

export async function POST(req: Request) {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, goal, level, age, weight, phone, notifications } = body;

    if (name) {
        await db.update(users).set({ name }).where(eq(users.id, userId));
    }

    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1).then(r => r[0]);

    if (existing) {
        const updated = await db.update(userProfiles).set({
            goal, level,
            age: age ? parseInt(age) : null,
            weight: weight ? parseInt(weight) : null,
            phone: phone || null,
            notifications: notifications ?? true,
            onboardingCompleted: true,
            updatedAt: new Date(),
        }).where(eq(userProfiles.userId, userId)).returning();
        return NextResponse.json({ profile: updated[0] });
    } else {
        const inserted = await db.insert(userProfiles).values({
            userId,
            goal, level,
            age: age ? parseInt(age) : null,
            weight: weight ? parseInt(weight) : null,
            phone: phone || null,
            notifications: notifications ?? true,
            onboardingCompleted: true,
        }).returning();
        return NextResponse.json({ profile: inserted[0] });
    }
}
