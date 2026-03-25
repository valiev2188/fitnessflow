import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    telegramId: text("telegram_id").notNull().unique(),
    name: text("name"),
    username: text("username"),
    role: text("role").notNull().default("user"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const userProfiles = sqliteTable("user_profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    goal: text("goal"),
    level: text("level"),
    age: integer("age"),
    weight: integer("weight"),
    phone: text("phone"),
    notifications: integer("notifications", { mode: "boolean" }).default(true),
    onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).default(false),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
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
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const subscriptions = sqliteTable("subscriptions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull(),
    status: text("status").notNull(),
    plan: text("plan").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const loginSessions = sqliteTable("login_sessions", {
    id: text("id").primaryKey(),
    telegramId: text("telegram_id"),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const nutritionWeeks = sqliteTable("nutrition_weeks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    weekNumber: integer("week_number").notNull(),
    title: text("title").notNull(),
    groceryList: text("grocery_list"),
});

export const nutritionDays = sqliteTable("nutrition_days", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    weekId: integer("week_id").references(() => nutritionWeeks.id).notNull(),
    dayNumber: integer("day_number").notNull(),
});

export const nutritionMeals = sqliteTable("nutrition_meals", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dayId: integer("day_id").references(() => nutritionDays.id).notNull(),
    mealType: text("meal_type").notNull(), // breakfast | lunch | dinner
    calorieLevel: integer("calorie_level").notNull(), // 1200 | 1400 | 1600 | 1800
    content: text("content").notNull(),
});

export const userNutritionSettings = sqliteTable("user_nutrition_settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    calorieLevel: integer("calorie_level").notNull().default(1400),
});
