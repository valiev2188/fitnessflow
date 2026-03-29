import { NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes, promoCodeUsages, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

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

export async function GET(req: Request) {
    const admin = await getAdminUser(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const codes = await db.select().from(promoCodes).orderBy(promoCodes.createdAt);
    return NextResponse.json({ codes });
}

export async function POST(req: Request) {
    const admin = await getAdminUser(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { code, discountType, discountValue, maxUses, expiresAt, applicablePlan } = await req.json();

        if (!code || !discountType || discountValue === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newCode = await db
            .insert(promoCodes)
            .values({
                code: code.toUpperCase(),
                discountType,
                discountValue: parseInt(discountValue),
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                applicablePlan: applicablePlan || null,
                isActive: true,
            })
            .returning()
            .then(r => r[0]);

        return NextResponse.json({ code: newCode });
    } catch (error: any) {
        if (error.message?.includes('UNIQUE')) {
            return NextResponse.json({ error: 'Промокод с таким кодом уже существует' }, { status: 409 });
        }
        console.error('Create promo code error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
