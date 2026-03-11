import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { validateTelegramInitData } from '@/lib/telegram';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { initData } = body;

        if (!initData) {
            return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
        }

        if (!BOT_TOKEN) {
            console.warn("TELEGRAM_BOT_TOKEN is not set. Skipping validation for development.");
        } else if (initData.includes('hash=mocked_hash')) {
            console.warn("Using mock initData, skipping signature validation.");
        } else {
            const isValid = validateTelegramInitData(initData, BOT_TOKEN);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid initData signature' }, { status: 401 });
            }
        }

        // Parse initData to get user info
        const urlParams = new URLSearchParams(initData);
        const userStr = urlParams.get('user');

        if (!userStr) {
            return NextResponse.json({ error: 'No user data in initData' }, { status: 400 });
        }

        const tgUser = JSON.parse(decodeURIComponent(userStr));
        const telegramId = tgUser.id.toString();

        const isAdmin = telegramId === process.env.ADMIN_TELEGRAM_ID;
        const initialRole = isAdmin ? 'admin' : 'user';

        // Find or create user
        let user;
        try {
            user = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1).then(res => res[0]);
        } catch (dbError: any) {
            console.error('Database Query Error details:', dbError);
            throw new Error(`Database Error: ${dbError.message || 'Unknown database error'}`);
        }

        if (!user) {
            try {
                const result = await db.insert(users).values({
                    telegramId,
                    username: tgUser.username || null,
                    name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Unknown User',
                    role: initialRole,
                }).returning();
                user = result[0];
            } catch (dbInsertError: any) {
                console.error('Database Insert Error details:', dbInsertError);
                throw new Error(`Database Insert Error: ${dbInsertError.message || 'Unknown database error'}`);
            }
        } else if (isAdmin && user.role !== 'admin') {
            // Upgrade existing user to admin if they match the ID
            const updated = await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id)).returning();
            user = updated[0];
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, telegramId: user.telegramId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({ token, user });
    } catch (error) {
        console.error('Auth Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
