import { db } from '../src/db/index';
import { programs } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const updated = await db.update(programs)
        .set({ price: 169990, durationDays: 21 })
        .where(eq(programs.title, 'Старт'))
        .returning();
    console.log('Updated program:', updated);
    process.exit(0);
}

main().catch(console.error);
