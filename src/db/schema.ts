import { pgTable, text, integer, timestamp, boolean, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    telegramId: text("telegram_id").notNull().unique(),
    name: text("name"),
    username: text("username"),
    role: text("role").notNull().default("user"), // "admin" or "user"
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    goal: text("goal"),          // "lose_weight" | "gain_muscle" | "tone" | "health"
    level: text("level"),        // "beginner" | "intermediate" | "advanced"
    age: integer("age"),
    weight: integer("weight"),   // optional, in kg
    phone: text("phone"),        // optional
    notifications: boolean("notifications").default(true),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    durationDays: integer("duration_days").notNull(),
    price: integer("price").default(0),
});

export const workouts = pgTable("workouts", {
    id: serial("id").primaryKey(),
    programId: integer("program_id").references(() => programs.id).notNull(),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    videoUrl: text("video_url"),
    description: text("description"),
});

export const userProgress = pgTable("user_progress", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    workoutId: integer("workout_id").references(() => workouts.id).notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
});

export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    status: text("status").notNull(),
    plan: text("plan").notNull(),
    expiresAt: timestamp("expires_at"),
});
