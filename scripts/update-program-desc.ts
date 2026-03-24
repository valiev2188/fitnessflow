import { db } from '../src/db/index';
import { programs } from '../src/db/schema';
import { eq, like } from 'drizzle-orm';

async function main() {
    const newDescription = '21 упражнений для тех, кто только начинает. Освой азы, правильную технику и полюби движение без стресса. В курс включен 21 модуль.';
    
    // Update the 'Старт' program
    await db.update(programs)
        .set({ description: newDescription })
        .where(like(programs.title, '%Старт%'));
        
    console.log('Successfully updated the "Старт" program description in the database.');
    process.exit(0);
}

main().catch(console.error);
