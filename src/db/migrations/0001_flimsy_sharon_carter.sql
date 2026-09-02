CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `posts_to_categories` (
	`postId` text NOT NULL,
	`categoryId` text NOT NULL,
	PRIMARY KEY(`postId`, `categoryId`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `account` ADD `issuer` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `locale` text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `translationGroupId` text;--> statement-breakpoint
CREATE INDEX `idx_posts_translation_group` ON `posts` (`translationGroupId`);--> statement-breakpoint
CREATE INDEX `idx_posts_locale_slug` ON `posts` (`locale`,`slug`);