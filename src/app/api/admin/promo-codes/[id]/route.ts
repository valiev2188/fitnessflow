import { NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes, users } from '@/db/schema';
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const admin = await getAdminUser(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const id = parseInt(params.id);
        const body = await req.json();

        const updated = await db
            .update(promoCodes)
            .set(body)
            .where(eq(promoCodes.id, id))
            .returning()
            .then(r => r[0]);

        return NextResponse.json({ code: updated });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const admin = await getAdminUser(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const id = parseInt(params.id);
        await db.delete(promoCodes).where(eq(promoCodes.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
