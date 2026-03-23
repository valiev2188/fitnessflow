import { db } from "../src/db";
import { users } from "../src/db/schema";
import { ne, eq } from "drizzle-orm";
import "dotenv/config";

async function run() {
  try {
    // 1. Remove admin role from everyone EXCEPT 5369141852
    await db.update(users)
      .set({ role: 'user' })
      .where(ne(users.telegramId, '5369141852'));
      
    // 2. Explicitly ensure 5369141852 is admin
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.telegramId, '5369141852'));

    console.log("Updated roles!");
    const allUsers = await db.select().from(users);
    console.log("Users after update:", allUsers);

  } catch(e) {
    console.error("DB error:", e);
  }
}
run();
