import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Use separate URL and token (required by libsql client)
const dbUrl = process.env.TURSO_DB_URL || process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({
    url: dbUrl,
    authToken,
});

export const db = drizzle(client, { schema });
