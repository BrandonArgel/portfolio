CREATE TABLE `post_bookmarks` (
	`userId` text NOT NULL,
	`postId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`userId`, `postId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_post_bookmarks_post_id` ON `post_bookmarks` (`postId`);--> statement-breakpoint
CREATE INDEX `idx_post_bookmarks_user_created_at` ON `post_bookmarks` (`userId`,`createdAt`);