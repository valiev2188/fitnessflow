import { NextResponse } from 'next/server';
import { db } from '@/db';
import { nutritionWeeks, nutritionDays, nutritionMeals } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const calorieLevel = parseInt(searchParams.get('calorie') || '1400');

        const weeks = await db.select().from(nutritionWeeks).orderBy(asc(nutritionWeeks.weekNumber));
        const days = await db.select().from(nutritionDays).orderBy(asc(nutritionDays.dayNumber));
        const meals = await db.select().from(nutritionMeals).where(eq(nutritionMeals.calorieLevel, calorieLevel));

        const data = weeks.map(w => {
            const weekDays = days.filter(d => d.weekId === w.id).map(d => {
                const dayMeals = meals.filter(m => m.dayId === d.id);
                // Sort meals: breakfast, lunch, dinner
                const sortedMeals = [];
                const bf = dayMeals.find(m => m.mealType === 'breakfast');
                if (bf) sortedMeals.push(bf);
                const ln = dayMeals.find(m => m.mealType === 'lunch');
                if (ln) sortedMeals.push(ln);
                const dn = dayMeals.find(m => m.mealType === 'dinner');
                if (dn) sortedMeals.push(dn);

                return {
                    id: d.id,
                    dayNumber: d.dayNumber,
                    meals: sortedMeals.map(m => ({
                        id: m.id,
                        type: m.mealType,
                        content: m.content
                    }))
                };
            });
            return {
                id: w.id,
                weekNumber: w.weekNumber,
                title: w.title,
                groceryList: w.groceryList,
                days: weekDays
            };
        });

        return NextResponse.json({ weeks: data });
    } catch (e: any) {
        console.error('Nutrition API Error:', e);
        return NextResponse.json({ error: 'Failed to fetch nutrition data' }, { status: 500 });
    }
}
