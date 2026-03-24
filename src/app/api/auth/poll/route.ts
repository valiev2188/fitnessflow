import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, loginSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session');
    
    if (!sessionId) return NextResponse.json({ error: 'Missing session' }, { status: 400 });

    try {
        const session = await db.select().from(loginSessions).where(eq(loginSessions.id, sessionId)).limit(1).then(r => r[0]);

        if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 404 });

        if (session.status === 'approved' && session.telegramId) {
            // Fetch user
            const user = await db.select().from(users).where(eq(users.telegramId, session.telegramId)).limit(1).then(r => r[0]);
            
            if (!user) {
                // Should not happen as bot creates user before approving
                return NextResponse.json({ status: 'pending' });
            }

            const token = jwt.sign({ userId: user.id, telegramId: user.telegramId }, JWT_SECRET, { expiresIn: '7d' });

            const response = NextResponse.json({ status: 'approved', token, user });
            response.cookies.set('fitness_web_token', token, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'lax', 
                maxAge: 60 * 60 * 24 * 7, 
                path: '/'
            });
            
            // Delete used session
            await db.delete(loginSessions).where(eq(loginSessions.id, sessionId));
            
            return response;
        }

        if (session.status === 'rejected') {
            await db.delete(loginSessions).where(eq(loginSessions.id, sessionId));
            return NextResponse.json({ status: 'rejected' });
        }

        return NextResponse.json({ status: 'pending' });
    } catch (e) {
        console.error('Poll error', e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
