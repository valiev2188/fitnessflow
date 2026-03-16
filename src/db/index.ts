import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Support both formats:
//   Option A (simple): DATABASE_URL=libsql://host?authToken=TOKEN (all in one)
//   Option B (split):  TURSO_DB_URL=libsql://host + TURSO_AUTH_TOKEN=TOKEN
const PROD_URL = 'libsql://turso-db-create-fitnessflow-abdulazizvaliev.aws-eu-west-1.turso.io';
const PROD_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMxODgyODUsImlkIjoiMDE5Y2RhM2ItODkwMS03YzRlLWJhODItNzhlMDNkMTc1ZjliIiwicmlkIjoiNjEwNGIwMTUtZGYzMi00YTQyLWE4OGItZDIwNDFkOWUwOWY4In0.F8PtUN9VDmXmTOxibL8bRMr-glPnoarbZ8hJSGU_9kbFwWK24olTWfWNx6nUdKBV-daalLcU5lpu4rM1OzLbBg';

const isProd = process.env.NODE_ENV === 'production';
const rawUrl = isProd ? PROD_URL : (process.env.TURSO_DB_URL || process.env.DATABASE_URL || 'file:local.db');

let dbUrl = rawUrl;
let authToken: string | undefined = isProd ? PROD_TOKEN : process.env.TURSO_AUTH_TOKEN;

// If authToken not set separately, try to extract it from URL
if (!authToken && rawUrl.startsWith('libsql://')) {
    try {
        const urlObj = new URL(rawUrl);
        const embedded = urlObj.searchParams.get('authToken');
        if (embedded) {
            authToken = embedded;
            // Strip the authToken from URL to avoid conflict
            urlObj.searchParams.delete('authToken');
            dbUrl = urlObj.toString();
        }
    } catch (_) { }
}

const client = createClient({ url: dbUrl, authToken });

export const db = drizzle(client, { schema });

