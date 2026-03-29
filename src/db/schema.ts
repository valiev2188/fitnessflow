import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    telegramId: text("telegram_id").notNull().unique(),
    name: text("name"),
    username: text("username"),
    role: text("role").notNull().default("user"),
    referralCode: text("referral_code").unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const userProfiles = sqliteTable("user_profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    goal: text("goal"),
    level: text("level"),
    age: integer("age"),
    height: integer("height"),
    weight: integer("weight"),
    gender: text("gender"),
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

// --- Points & Gamification ---

export const userPoints = sqliteTable("user_points", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    balance: integer("balance").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const pointTransactions = sqliteTable("point_transactions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(),
    type: text("type").notNull(), // workout_complete | course_complete | referral_signup | referral_purchase | admin_grant
    description: text("description"),
    relatedId: integer("related_id"), // workoutId, programId, referralId, etc.
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// --- Referrals ---

export const referrals = sqliteTable("referrals", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    referrerId: integer("referrer_id").references(() => users.id).notNull(),
    referredUserId: integer("referred_user_id").references(() => users.id),
    referredTelegramId: text("referred_telegram_id").unique(),
    status: text("status").notNull().default("pending"), // pending | registered | purchased
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// --- Promo Codes ---

export const promoCodes = sqliteTable("promo_codes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    discountType: text("discount_type").notNull(), // percent | flat
    discountValue: integer("discount_value").notNull(),
    maxUses: integer("max_uses"), // null = unlimited
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    applicablePlan: text("applicable_plan"), // null = any plan
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const promoCodeUsages = sqliteTable("promo_code_usages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    promoCodeId: integer("promo_code_id").references(() => promoCodes.id).notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    usedAt: integer("used_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// --- Payments ---

export const payments = sqliteTable("payments", {
    id:                integer("id").primaryKey({ autoIncrement: true }),
    userId:            integer("user_id").references(() => users.id).notNull(),
    plan:              text("plan").notNull(),
    amount:            integer("amount").notNull(),
    finalAmount:       integer("final_amount").notNull(),
    status:            text("status").notNull().default("pending"), // pending | paid | failed
    promoCode:         text("promo_code"),
    promoCodeId:       integer("promo_code_id").references(() => promoCodes.id),
    clickTransId:      text("click_trans_id"),
    merchantPrepareId: integer("merchant_prepare_id"),
    createdAt:         integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
    paidAt:            integer("paid_at", { mode: "timestamp" }),
});
