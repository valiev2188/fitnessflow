import { db } from './src/db/index';
import { programs, users } from './src/db/schema';
import * as dotenv from 'dotenv';
process.env.TURSO_DB_URL = 'libsql://turso-db-create-fitnessflow-abdulazizvaliev.aws-eu-west-1.turso.io';
process.env.TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMxODgyODUsImlkIjoiMDE5Y2RhM2ItODkwMS03YzRlLWJhODItNzhlMDNkMTc1ZjliIiwicmlkIjoiNjEwNGIwMTUtZGYzMi00YTQyLWE4OGItZDIwNDFkOWUwOWY4In0.F8PtUN9VDmXmTOxibL8bRMr-glPnoarbZ8hJSGU_9kbFwWK24olTWfWNx6nUdKBV-daalLcU5lpu4rM1OzLbBg';
process.env.DATABASE_URL = `${process.env.TURSO_DB_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`;

async function run() {
  const p = await db.select().from(programs);
  const u = await db.select().from(users);
  console.log('PROGRAMS in Turso: ', p.map(x => x.title));
  console.log('USERS in Turso: ', u.length);
}
run();
