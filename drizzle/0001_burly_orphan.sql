CREATE TABLE `forum_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`orderIndex` int NOT NULL DEFAULT 0,
	`isLocked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forum_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `forum_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`authorMinecraftNick` varchar(64),
	`content` text NOT NULL,
	`isReported` boolean NOT NULL DEFAULT false,
	`reportReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forum_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`authorMinecraftNick` varchar(64),
	`isPinned` boolean NOT NULL DEFAULT false,
	`isLocked` boolean NOT NULL DEFAULT false,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`coverUrl` text,
	`isPublished` boolean NOT NULL DEFAULT true,
	`authorNick` varchar(64) NOT NULL DEFAULT 'YTSmailDog',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`category` enum('release','beta','in_development') NOT NULL DEFAULT 'beta',
	`description` text NOT NULL,
	`contentMarkdown` text,
	`coverUrl` text,
	`downloadUrl` text,
	`externalLink` text,
	`version` varchar(64) NOT NULL DEFAULT 'v0.1-beta',
	`isPublished` boolean NOT NULL DEFAULT true,
	`authorName` varchar(128) NOT NULL DEFAULT 'SmailLabs',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT 'SmailLabs',
	`tagline` text,
	`logoUrl` text,
	`youtubeUrl` varchar(255) DEFAULT 'https://youtube.com/@ytsmaildog',
	`discordUrl` varchar(255) DEFAULT 'https://discord.gg/',
	`themePreset` varchar(64) NOT NULL DEFAULT 'emerald-dark',
	`primaryColor` varchar(32) NOT NULL DEFAULT '#10b981',
	`accentColor` varchar(32) NOT NULL DEFAULT '#3b82f6',
	`heroBadgeText` varchar(128) DEFAULT 'Команда разработки и бета-проектов',
	`heroTitle` varchar(255) DEFAULT 'SmailLabs — инновации в Minecraft и вебе',
	`heroDescription` text,
	`enable3dHeads` boolean NOT NULL DEFAULT true,
	`layoutConfig` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `team_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(128) NOT NULL,
	`minecraftNick` varchar(64) NOT NULL,
	`skinSourceType` enum('licensed','tlauncher') NOT NULL DEFAULT 'licensed',
	`age` int,
	`roleDesired` varchar(128) NOT NULL,
	`contacts` varchar(255) NOT NULL,
	`portfolioOrExperience` text NOT NULL,
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`roleTitle` varchar(128) NOT NULL,
	`minecraftNick` varchar(64) NOT NULL,
	`skinSourceType` enum('licensed','tlauncher') NOT NULL DEFAULT 'licensed',
	`skinUrl` text,
	`bio` text,
	`orderIndex` int NOT NULL DEFAULT 0,
	`isBetaTester` boolean NOT NULL DEFAULT false,
	`youtubeChannel` varchar(255),
	`discordTag` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`fileKey` text NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(128),
	`sizeBytes` int DEFAULT 0,
	`uploadedBy` varchar(128) DEFAULT 'Admin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','team_member','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `minecraftNick` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `minecraftSkinType` enum('licensed','tlauncher') DEFAULT 'licensed' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `minecraftSkinUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;