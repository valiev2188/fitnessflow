import { db } from '../src/db/index';
import { programs, workouts } from '../src/db/schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
    console.log('Seeding database...');
    try {
        const insertedPrograms = await db.insert(programs).values([
            {
                title: '30-Day Fat Burn',
                description: 'A high-intensity program designed to burn fat and build lean muscle.',
                durationDays: 30,
                price: 0,
            },
            {
                title: 'Strength Foundations',
                description: 'Build core strength with fundamental lifting techniques.',
                durationDays: 14,
                price: 999, // $9.99
            }
        ]).returning();

        console.log('Inserted programs:', insertedPrograms.map(p => p.title));

        const program1Id = insertedPrograms[0].id;
        const program2Id = insertedPrograms[1].id;

        await db.insert(workouts).values([
            {
                programId: program1Id,
                dayNumber: 1,
                title: 'Full Body HIIT',
                videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                description: '1. Jumping Jacks (45s)\n2. High Knees (45s)\n3. Burpees (30s)\nRepeat 3 times.',
            },
            {
                programId: program1Id,
                dayNumber: 2,
                title: 'Core Crusher',
                videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                description: '1. Crunches (20 reps)\n2. Plank (60s)\n3. Russian Twists (30 reps)\nRepeat 3 times.',
            },
            {
                programId: program2Id,
                dayNumber: 1,
                title: 'Upper Body Basics',
                videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                description: '1. Pushups (3 sets of 10)\n2. Dumbbell Rows (3 sets of 12)',
            }
        ]);
        console.log('Inserted workouts.');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
