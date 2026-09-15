ALTER TABLE `site_settings` ADD `youtubeSyncFrequency` varchar(32) DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `discordNotificationsEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `discordNotifyShorts` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `discordNotificationFormat` varchar(16) DEFAULT 'embed' NOT NULL;