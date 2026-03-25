import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export async function verifyAuth(req: Request) {
    let token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
        const cookieStore = cookies();
        token = cookieStore.get('fitness_web_token')?.value;
    }
    
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1).then(r => r[0]);
        return user || null;
    } catch {
        return null;
    }
}
