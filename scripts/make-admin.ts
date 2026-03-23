import { db } from "../src/db";
import { users } from "../src/db/schema";
import "dotenv/config";

async function run() {
  try {
    const allUsers = await db.select().from(users);
    console.log("Users before update:", allUsers);

    if (allUsers.length > 0) {
      await db.update(users).set({ role: 'admin' });
      console.log("Updated all users to admin!");
    } else {
      console.log("No users found in the DB. Please open the app in Telegram first to create an account.");
    }
  } catch(e) {
    console.error("DB error:", e);
  }
}
run();
