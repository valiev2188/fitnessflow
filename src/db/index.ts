import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Helper to extract or define connection info
const dbUrl = process.env.DATABASE_URL || 'file:local.db';

// Extract authToken from the URL if it's there (libsql://...?authToken=...)
let authToken;
try {
    const urlObj = new URL(dbUrl);
    authToken = urlObj.searchParams.get('authToken') || process.env.TURSO_AUTH_TOKEN;
} catch (e) {
    // If it's a local file URL, URL parser might fail, which is fine
}

const client = createClient({
    url: dbUrl,
    authToken: authToken,
});

export const db = drizzle(client, { schema });
