CREATE TABLE `payments` (
	`id`                  integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id`             integer NOT NULL,
	`plan`                text NOT NULL,
	`amount`              integer NOT NULL,
	`final_amount`        integer NOT NULL,
	`status`              text DEFAULT 'pending' NOT NULL,
	`promo_code`          text,
	`promo_code_id`       integer,
	`click_trans_id`      text,
	`merchant_prepare_id` integer,
	`created_at`          integer DEFAULT (unixepoch()),
	`paid_at`             integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON UPDATE no action ON DELETE no action
);
