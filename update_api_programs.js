const fs = require('fs');
const content = `import { NextResponse } from 'next/server';
import { db } from '@/db';
import { programs, subscriptions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me';

export async function GET(req: Request) {
    try {
        const allPrograms = await db.select().from(programs);
        
        let userSubs = [];
        const auth = req.headers.get('authorization');
        if (auth?.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(auth.substring(7), JWT_SECRET);
                const userId = decoded.userId;
                
                // Get active subscriptions for user
                userSubs = await db.select().from(subscriptions).where(
                    and(
                        eq(subscriptions.userId, userId),
                        eq(subscriptions.status, 'active')
                    )
                );
            } catch (err) {
                // Invalid token, ignore user specific data
            }
        }

        const enrichedPrograms = allPrograms.map(p => {
            // Check if user has active sub for this program plan (matching title)
            const sub = userSubs.find(s => s.plan === p.title && (!s.expiresAt || new Date(s.expiresAt) > new Date()));
            return {
                ...p,
                hasAccess: !!sub,
                accessUntil: sub?.expiresAt || null
            };
        });

        return NextResponse.json({ programs: enrichedPrograms });
    } catch (error: any) {
        console.error('Programs get error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch programs', 
            details: error.message 
        }, { status: 500 });
    }
}
`;
fs.writeFileSync('src/app/api/programs/route.ts', content);
