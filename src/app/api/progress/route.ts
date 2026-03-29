import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userProgress, workouts, pointTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { awardPoints } from '@/lib/points';

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

        const wasAlreadyCompleted = existing?.completed === true;

        if (existing) {
            await db
                .update(userProgress)
                .set({ completed, completedAt: completed ? new Date() : null })
                .where(eq(userProgress.id, existing.id));
        } else {
            await db.insert(userProgress).values({
                userId,
                workoutId,
                completed,
                completedAt: completed ? new Date() : null,
            });
        }

        // Award points only on new completion (not re-marking)
        if (completed && !wasAlreadyCompleted) {
            await awardPoints(userId, 10, 'workout_complete', 'Тренировка завершена', workoutId);

            // Check if the whole course is now complete
            const workout = await db
                .select({ programId: workouts.programId })
                .from(workouts)
                .where(eq(workouts.id, workoutId))
                .limit(1)
                .then(r => r[0]);

            if (workout) {
                const { programId } = workout;

                // Count total workouts in this program
                const allWorkouts = await db
                    .select({ id: workouts.id })
                    .from(workouts)
                    .where(eq(workouts.programId, programId));

                const workoutIds = allWorkouts.map(w => w.id);

                // Count how many the user completed in this program
                const completedRows = await db
                    .select()
                    .from(userProgress)
                    .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)));

                const completedInProgram = completedRows.filter(r => workoutIds.includes(r.workoutId)).length;

                if (completedInProgram === workoutIds.length && workoutIds.length > 0) {
                    // Check we haven't already awarded course_complete for this program
                    const alreadyAwarded = await db
                        .select()
                        .from(pointTransactions)
                        .where(and(
                            eq(pointTransactions.userId, userId),
                            eq(pointTransactions.type, 'course_complete'),
                            eq(pointTransactions.relatedId, programId)
                        ))
                        .limit(1)
                        .then(r => r[0]);

                    if (!alreadyAwarded) {
                        await awardPoints(userId, 200, 'course_complete', 'Курс полностью завершён! 🎉', programId);
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
}
