CREATE TABLE `login_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `nutrition_days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_id` integer NOT NULL,
	`day_number` integer NOT NULL,
	FOREIGN KEY (`week_id`) REFERENCES `nutrition_weeks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nutrition_meals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer NOT NULL,
	`meal_type` text NOT NULL,
	`calorie_level` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `nutrition_days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nutrition_weeks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_number` integer NOT NULL,
	`title` text NOT NULL,
	`grocery_list` text
);
--> statement-breakpoint
CREATE TABLE `point_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`related_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `promo_code_usages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`promo_code_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`used_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_value` integer NOT NULL,
	`max_uses` integer,
	`used_count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer,
	`applicable_plan` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promo_codes_code_unique` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referrer_id` integer NOT NULL,
	`referred_user_id` integer,
	`referred_telegram_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referrals_referred_telegram_id_unique` ON `referrals` (`referred_telegram_id`);--> statement-breakpoint
CREATE TABLE `user_nutrition_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`calorie_level` integer DEFAULT 1400 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_nutrition_settings_user_id_unique` ON `user_nutrition_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_points_user_id_unique` ON `user_points` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`goal` text,
	`level` text,
	`age` integer,
	`height` integer,
	`weight` integer,
	`gender` text,
	`phone` text,
	`notifications` integer DEFAULT true,
	`onboarding_completed` integer DEFAULT false,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
DROP INDEX "promo_codes_code_unique";--> statement-breakpoint
DROP INDEX "referrals_referred_telegram_id_unique";--> statement-breakpoint
DROP INDEX "user_nutrition_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "user_points_user_id_unique";--> statement-breakpoint
DROP INDEX "user_profiles_user_id_unique";--> statement-breakpoint
DROP INDEX "users_telegram_id_unique";--> statement-breakpoint
DROP INDEX "users_referral_code_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "created_at" TO "created_at" integer DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_referral_code_unique` ON `users` (`referral_code`);--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referral_code` text;