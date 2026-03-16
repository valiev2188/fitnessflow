import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error('[DB] CRITICAL: TURSO_DB_URL environment variable is not set!');
}

const client = createClient({
    url: url || '',
    authToken: authToken,
});

client.execute('SELECT 1').catch(err =>
    console.error('[DB] Connection test failed:', err.message)
);

export const db = drizzle(client, { schema });
