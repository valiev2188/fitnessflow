import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userNutritionSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const settings = await db.select().from(userNutritionSettings).where(eq(userNutritionSettings.userId, user.id)).limit(1).then(r => r[0]);
        return NextResponse.json({ calorieLevel: settings?.calorieLevel || 1400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { calorieLevel } = await req.json();
        
        await db.insert(userNutritionSettings)
            .values({ userId: user.id, calorieLevel })
            .onConflictDoUpdate({ target: userNutritionSettings.userId, set: { calorieLevel } });
            
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
