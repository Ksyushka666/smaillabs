ALTER TABLE `youtube_videos` ADD `isShort` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `youtube_videos` ADD `discordNotifiedAt` timestamp;