import { NextResponse } from 'next/server';
import { db } from '@/db';
import { programs, workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export async function GET(req: Request, props: { params: Promise<{ programId: string }> }) {
    try {
        const params = await props.params;
        const programId = parseInt(params.programId, 10);

        if (isNaN(programId)) {
            return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
        }

        const program = await db.select().from(programs).where(eq(programs.id, programId)).limit(1).then(res => res[0]);

        if (!program) {
            return NextResponse.json({ error: 'Program not found' }, { status: 404 });
        }

        const programWorkouts = await db.select().from(workouts).where(eq(workouts.programId, programId));

        return NextResponse.json({ program, workouts: programWorkouts });
    } catch (error) {
        console.error('Program fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
    }
}
