import { NextResponse } from 'next/server';
import { db } from '@/db';
import { loginSessions } from '@/db/schema';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const sessionId = crypto.randomUUID();
        await db.insert(loginSessions).values({ id: sessionId, status: 'pending' });
        return NextResponse.json({ sessionId });
    } catch (e: any) {
        console.error('Session create error', e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
