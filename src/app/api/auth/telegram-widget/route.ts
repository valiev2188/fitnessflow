import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8272000512:AAGAE_OEKRMR8SiIwtGRrdJfZb7mJ3BEuRg';
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '';

/**
 * Verifies Telegram Login Widget data using HMAC-SHA256.
 * Telegram sends: id, first_name, last_name, username, photo_url, auth_date, hash
 * We must verify: hash == HMAC_SHA256( data_check_string, SHA256(bot_token) )
 */
function verifyTelegramWidgetData(data: Record<string, string>): boolean {
    const { hash, ...rest } = data;
    if (!hash || !BOT_TOKEN) return false;

    // Build data-check string: sorted key=value pairs joined by \n
    const dataCheckString = Object.keys(rest)
        .sort()
        .map(k => `${k}=${rest[k]}`)
        .join('\n');

    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Also check auth_date is not too old (within 24h)
    const authDate = parseInt(rest.auth_date || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return false; // Expired

    return calculatedHash === hash;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { telegramData } = body;

        if (!telegramData || !telegramData.id) {
            return NextResponse.json({ error: 'Missing Telegram data' }, { status: 400 });
        }

        // Verify the hash from Telegram Widget
        const isValid = verifyTelegramWidgetData(telegramData);
        if (!isValid && process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Invalid Telegram data signature' }, { status: 401 });
        }

        const telegramId = telegramData.id.toString();
        const isAdmin = telegramId === ADMIN_ID;

        // Find or create user
        let user = await db
            .select()
            .from(users)
            .where(eq(users.telegramId, telegramId))
            .limit(1)
            .then(r => r[0]);

        if (!user) {
            const result = await db.insert(users).values({
                telegramId,
                username: telegramData.username || null,
                name: [telegramData.first_name, telegramData.last_name].filter(Boolean).join(' ') || 'Unknown',
                role: isAdmin ? 'admin' : 'user',
            }).returning();
            user = result[0];
        } else if (isAdmin && user.role !== 'admin') {
            const updated = await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id)).returning();
            user = updated[0];
        }

        // Issue JWT token
        const token = jwt.sign(
            { userId: user.id, telegramId: user.telegramId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie for web session
        const response = NextResponse.json({ token, user });
        response.cookies.set('fitness_web_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Telegram Widget Auth Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
