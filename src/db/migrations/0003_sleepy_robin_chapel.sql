CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`content` text NOT NULL,
	`postId` text NOT NULL,
	`authorId` text NOT NULL,
	`parentId` text,
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parentId`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post_id` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `idx_comments_author_id` ON `comments` (`authorId`);--> statement-breakpoint
CREATE INDEX `idx_comments_parent_id` ON `comments` (`parentId`);--> statement-breakpoint
CREATE INDEX `idx_comments_post_created_at` ON `comments` (`postId`,`createdAt`);--> statement-breakpoint
DROP INDEX IF EXISTS "idx_accounts_user_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_accounts_provider_account";--> statement-breakpoint
DROP INDEX IF EXISTS "sessions_token_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_sessions_user_id";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_verifications_identifier";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_slug_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_comments_post_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_comments_author_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_comments_parent_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_comments_post_created_at";--> statement-breakpoint
DROP INDEX IF EXISTS "posts_slug_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_posts_translation_group";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_posts_locale_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_posts_author_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_posts_last_modified_by";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_posts_locale_published_created_at";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_posts_to_categories_category_id";--> statement-breakpoint
ALTER TABLE `accounts` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
CREATE INDEX `idx_accounts_user_id` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_accounts_provider_account` ON `accounts` (`providerId`,`accountId`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_verifications_identifier` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_translation_group` ON `posts` (`translationGroupId`);--> statement-breakpoint
CREATE INDEX `idx_posts_locale_slug` ON `posts` (`locale`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_author_id` ON `posts` (`authorId`);--> statement-breakpoint
CREATE INDEX `idx_posts_last_modified_by` ON `posts` (`lastModifiedBy`);--> statement-breakpoint
CREATE INDEX `idx_posts_locale_published_created_at` ON `posts` (`locale`,`published`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_posts_to_categories_category_id` ON `posts_to_categories` (`categoryId`);--> statement-breakpoint
ALTER TABLE `accounts` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `verifications` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `verifications` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `categories` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `categories` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch());