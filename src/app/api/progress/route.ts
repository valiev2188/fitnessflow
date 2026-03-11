import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

async function getUserIdFromToken(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const progress = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
        return NextResponse.json({ progress });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { workoutId, completed } = await req.json();

        if (!workoutId) {
            return NextResponse.json({ error: 'Missing workoutId' }, { status: 400 });
        }

        // Check if progress already exists
        const existing = await db
            .select()
            .from(userProgress)
            .where(and(eq(userProgress.userId, userId), eq(userProgress.workoutId, workoutId)))
            .limit(1)
            .then(res => res[0]);

        if (existing) {
            // Update
            await db
                .update(userProgress)
                .set({ completed, completedAt: completed ? new Date() : null })
                .where(eq(userProgress.id, existing.id));
        } else {
            // Insert
            await db.insert(userProgress).values({
                userId,
                workoutId,
                completed,
                completedAt: completed ? new Date() : null,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
}
