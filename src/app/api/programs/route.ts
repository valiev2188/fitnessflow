import { NextResponse } from 'next/server';
import { db } from '@/db';
import { programs } from '@/db/schema';

export async function GET() {
    try {
        const allPrograms = await db.select().from(programs);
        return NextResponse.json({ programs: allPrograms });
    } catch (error) {
        console.error('Programs get error:', error);
        return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
    }
}
