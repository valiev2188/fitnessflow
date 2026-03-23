import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

const client = createClient({
    url: process.env.TURSO_DB_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function run() {
    const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
    console.log("Tables in database:", res.rows.map(r => r.name));
}
run();
