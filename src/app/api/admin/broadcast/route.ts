import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, subscriptions, userProfiles } from '@/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function getAdminUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number };
        const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1).then(r => r[0]);
        return user?.role === 'admin' ? user : null;
    } catch {
        return null;
    }
}

async function sendTelegramMessage(chatId: string, text: string) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    return res.ok;
}

export async function POST(req: Request) {
    const admin = await getAdminUser(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { message, audience } = await req.json();

        if (!message || !audience) {
            return NextResponse.json({ error: 'Missing message or audience' }, { status: 400 });
        }

        // Fetch all users with their subscriptions
        const allUsers = await db.select().from(users);
        const allSubs = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'));

        const now = new Date();
        const activeSubUserIds = new Set(
            allSubs
                .filter(s => !s.expiresAt || new Date(s.expiresAt) > now)
                .map(s => s.userId)
        );

        let targets: typeof allUsers = [];

        if (audience === 'all') {
            targets = allUsers;
        } else if (audience === 'active_subs') {
            targets = allUsers.filter(u => activeSubUserIds.has(u.id));
        } else if (audience === 'inactive') {
            targets = allUsers.filter(u => !activeSubUserIds.has(u.id));
        } else if (audience.startsWith('program:')) {
            const planName = audience.replace('program:', '');
            const planSubUserIds = new Set(
                allSubs
                    .filter(s => s.plan === planName && (!s.expiresAt || new Date(s.expiresAt) > now))
                    .map(s => s.userId)
            );
            targets = allUsers.filter(u => planSubUserIds.has(u.id));
        }

        let sent = 0;
        let failed = 0;

        for (const user of targets) {
            if (!user.telegramId) { failed++; continue; }
            const ok = await sendTelegramMessage(user.telegramId, message);
            if (ok) { sent++; } else { failed++; }
            // Rate limiting: stay well under Telegram's 30 msg/sec limit
            await new Promise(r => setTimeout(r, 50));
        }

        return NextResponse.json({ sent, failed, total: targets.length });
    } catch (error) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
