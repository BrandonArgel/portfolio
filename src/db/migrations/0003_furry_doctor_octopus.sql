DROP INDEX "categories_name_unique";--> statement-breakpoint
DROP INDEX "categories_slug_unique";--> statement-breakpoint
DROP INDEX "posts_slug_unique";--> statement-breakpoint
DROP INDEX "idx_posts_translation_group";--> statement-breakpoint
DROP INDEX "idx_posts_locale_slug";--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "description" TO "description" text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_translation_group` ON `posts` (`translationGroupId`);--> statement-breakpoint
CREATE INDEX `idx_posts_locale_slug` ON `posts` (`locale`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);