import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export async function GET(req: Request) {
    // Check Authorization header first (Mini App), then cookie (web)
    let token: string | null = null;

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else {
        // Read from cookies
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/fitness_web_token=([^;]+)/);
        if (match) token = match[1];
    }

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1).then(r => r[0]);
        if (!user) return NextResponse.json({ user: null }, { status: 401 });
        return NextResponse.json({ user, token });
    } catch {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
