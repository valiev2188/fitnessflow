import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

// Helper to authenticate admin
async function getAdminUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1).then(res => res[0]);
        if (user && user.role === 'admin') {
            return user;
        }
    } catch (e) {
        return null;
    }
    return null;
}

export async function POST(req: Request) {
    try {
        const adminUser = await getAdminUser(req);
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { telegramId, message } = body;

        if (!telegramId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
        }

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramId,
                text: message,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(data.description || 'Failed to send telegram message');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
