ALTER TABLE `posts` ADD `draft_content` text;--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "content" TO "content" text NOT NULL DEFAULT '';--> statement-breakpoint

DROP INDEX IF EXISTS `posts_slug_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_posts_locale_slug`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_posts_locale_slug` ON `posts` (`locale`,`slug`);