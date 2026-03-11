import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    telegramId: text("telegram_id").notNull().unique(),
    name: text("name"),
    username: text("username"),
    role: text("role").notNull().default("user"), // "admin" or "user"
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().defaultNow(),
});

export const userProfiles = sqliteTable("user_profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    goal: text("goal"),          // "lose_weight" | "gain_muscle" | "tone" | "health"
    level: text("level"),        // "beginner" | "intermediate" | "advanced"
    age: integer("age"),
    weight: integer("weight"),   // optional, in kg
    phone: text("phone"),        // optional
    notifications: integer("notifications", { mode: 'boolean' }).default(true),
    onboardingCompleted: integer("onboarding_completed", { mode: 'boolean' }).default(false),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

export const programs = sqliteTable("programs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    durationDays: integer("duration_days").notNull(),
    price: integer("price").default(0),
});

export const workouts = sqliteTable("workouts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    programId: integer("program_id").references(() => programs.id).notNull(),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    videoUrl: text("video_url"),
    description: text("description"),
});

export const userProgress = sqliteTable("user_progress", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull(),
    workoutId: integer("workout_id").references(() => workouts.id).notNull(),
    completed: integer("completed", { mode: 'boolean' }).default(false).notNull(),
    completedAt: integer("completed_at", { mode: 'timestamp' }),
});

export const subscriptions = sqliteTable("subscriptions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull(),
    status: text("status").notNull(),
    plan: text("plan").notNull(),
    expiresAt: integer("expires_at", { mode: 'timestamp' }),
});
