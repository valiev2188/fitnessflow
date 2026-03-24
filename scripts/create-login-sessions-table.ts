import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';

async function main() {
    await db.run(sql`
        CREATE TABLE IF NOT EXISTS login_sessions (
            id TEXT PRIMARY KEY,
            telegram_id TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at INTEGER DEFAULT (unixepoch())
        )
    `);
    console.log('Login sessions table created or already exists');
    process.exit(0);
}

main().catch(console.error);
