import { db } from "../src/db";
import { users } from "../src/db/schema";
import "dotenv/config";

async function run() {
  try {
    const allUsers = await db.select().from(users);
    console.log("Users:", allUsers);
  } catch(e) {
    console.error("DB error:", e);
  }
}
run();
