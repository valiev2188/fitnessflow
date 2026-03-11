import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts, subscriptions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export async function GET(req: Request, props: { params: Promise<{ workoutId: string }> }) {
    try {
        const params = await props.params;
        const workoutId = parseInt(params.workoutId, 10);

        if (isNaN(workoutId)) {
            return NextResponse.json({ error: 'Invalid workout ID' }, { status: 400 });
        }

        const workout = await db.select().from(workouts).where(eq(workouts.id, workoutId)).limit(1).then(res => res[0]);

        if (!workout) {
            return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
        }

        // Access Control
        const authHeader = req.headers.get('authorization');
        let hasAccess = false;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

                // Check if admin
                const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1).then(res => res[0]);
                if (user && user.role === 'admin') {
                    hasAccess = true;
                } else {
                    // Check subscription
                    const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, decoded.userId)).limit(1).then(res => res[0]);
                    if (sub && sub.status === 'active' && new Date(sub.expiresAt!) > new Date()) {
                        hasAccess = true;
                    }
                }
            } catch (e) {
                // Invalid token, ignore
            }
        }

        if (!hasAccess) {
            // Return censored workout
            return NextResponse.json({
                workout: {
                    ...workout,
                    videoUrl: null,
                    description: "🔐 Этот контент доступен только по подписке. Выберите подходящий тариф на главной странице и отправьте чек боту, чтобы получить доступ.",
                    isLocked: true
                }
            });
        }

        return NextResponse.json({ workout: { ...workout, isLocked: false } });
    } catch (error) {
        console.error('Workout fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
    }
}
