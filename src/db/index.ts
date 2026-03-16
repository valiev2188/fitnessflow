import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('[DB] CRITICAL: DATABASE_URL environment variable is not set!');
}

const pool = new Pool({
    connectionString: connectionString || '',
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('[DB Pool] Unexpected error on idle client:', err.message);
});

export const db = drizzle(pool, { schema });
