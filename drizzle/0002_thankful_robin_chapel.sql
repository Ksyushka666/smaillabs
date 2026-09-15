CREATE TABLE `youtube_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` varchar(32) NOT NULL,
	`channelId` varchar(64) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`thumbnailUrl` text NOT NULL,
	`videoUrl` text NOT NULL,
	`durationSeconds` int,
	`viewCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`hasApiStats` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `youtube_videos_id` PRIMARY KEY(`id`),
	CONSTRAINT `youtube_videos_videoId_unique` UNIQUE(`videoId`)
);
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeChannelId` varchar(64);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeChannelHandle` varchar(128);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeChannelTitle` varchar(255);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeChannelDescription` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeChannelThumbnailUrl` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeSubscriberCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeChannelViewCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeVideoCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeLastSyncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeLastSyncStatus` varchar(32);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `youtubeLastSyncError` text;