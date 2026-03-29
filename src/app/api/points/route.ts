import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserPoints } from '@/lib/points';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number };
        const data = await getUserPoints(userId);
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
