DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "categories_name_unique";--> statement-breakpoint
DROP INDEX "categories_slug_unique";--> statement-breakpoint
DROP INDEX "posts_slug_unique";--> statement-breakpoint
DROP INDEX "idx_posts_translation_group";--> statement-breakpoint
DROP INDEX "idx_posts_locale_slug";--> statement-breakpoint
ALTER TABLE `accounts` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_translation_group` ON `posts` (`translationGroupId`);--> statement-breakpoint
CREATE INDEX `idx_posts_locale_slug` ON `posts` (`locale`,`slug`);--> statement-breakpoint
ALTER TABLE `accounts` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `verifications` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `verifications` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT '"2026-10-03T18:25:54.525Z"';--> statement-breakpoint
ALTER TABLE `posts` ADD `draft` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `lastModifiedBy` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `categories` ADD `createdAt` integer DEFAULT '"2026-10-03T18:25:54.525Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `updatedAt` integer DEFAULT '"2026-10-03T18:25:54.525Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `description` text DEFAULT '';