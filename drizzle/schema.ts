import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "team_member", "admin"]).default("user").notNull(),
  minecraftNick: varchar("minecraftNick", { length: 64 }),
  minecraftSkinType: mysqlEnum("minecraftSkinType", ["licensed", "tlauncher", "elyby"]).default("licensed").notNull(),
  minecraftSkinUrl: text("minecraftSkinUrl"),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull().default("SmailLabs"),
  tagline: text("tagline"),
  logoUrl: text("logoUrl"),
  youtubeUrl: varchar("youtubeUrl", { length: 255 }).default("https://youtube.com/@ytsmaildog"),
  discordUrl: varchar("discordUrl", { length: 255 }).default("https://discord.gg/"),
  themePreset: varchar("themePreset", { length: 64 }).default("emerald-dark").notNull(),
  primaryColor: varchar("primaryColor", { length: 32 }).default("#10b981").notNull(),
  accentColor: varchar("accentColor", { length: 32 }).default("#3b82f6").notNull(),
  heroBadgeText: varchar("heroBadgeText", { length: 128 }).default("Команда разработки и бета-проектов"),
  heroTitle: varchar("heroTitle", { length: 255 }).default("SmailLabs — инновации в Minecraft и вебе"),
  heroDescription: text("heroDescription"),
  enable3dHeads: boolean("enable3dHeads").default(true).notNull(),
  layoutConfig: text("layoutConfig"),
  youtubeChannelId: varchar("youtubeChannelId", { length: 64 }),
  youtubeChannelHandle: varchar("youtubeChannelHandle", { length: 128 }),
  youtubeChannelTitle: varchar("youtubeChannelTitle", { length: 255 }),
  youtubeChannelDescription: text("youtubeChannelDescription"),
  youtubeChannelThumbnailUrl: text("youtubeChannelThumbnailUrl"),
  youtubeSubscriberCount: int("youtubeSubscriberCount").default(0),
  youtubeChannelViewCount: int("youtubeChannelViewCount").default(0),
  youtubeVideoCount: int("youtubeVideoCount").default(0),
  youtubeLastSyncedAt: timestamp("youtubeLastSyncedAt"),
  youtubeLastSyncStatus: varchar("youtubeLastSyncStatus", { length: 32 }),
  youtubeLastSyncError: text("youtubeLastSyncError"),
  youtubeScheduleCronTaskUid: varchar("youtubeScheduleCronTaskUid", { length: 65 }),
  youtubeSyncFrequency: varchar("youtubeSyncFrequency", { length: 32 }).default("daily").notNull(),
  discordNotificationsEnabled: boolean("discordNotificationsEnabled").default(true).notNull(),
  discordNotifyShorts: boolean("discordNotifyShorts").default(true).notNull(),
  discordNotificationFormat: varchar("discordNotificationFormat", { length: 16 }).default("embed").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  roleTitle: varchar("roleTitle", { length: 128 }).notNull(),
  minecraftNick: varchar("minecraftNick", { length: 64 }).notNull(),
  skinSourceType: mysqlEnum("skinSourceType", ["licensed", "tlauncher", "elyby"]).default("licensed").notNull(),
  skinUrl: text("skinUrl"),
  bio: text("bio"),
  orderIndex: int("orderIndex").default(0).notNull(),
  isBetaTester: boolean("isBetaTester").default(false).notNull(),
  youtubeChannel: varchar("youtubeChannel", { length: 255 }),
  discordTag: varchar("discordTag", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  category: mysqlEnum("category", ["release", "beta", "in_development"]).default("beta").notNull(),
  description: text("description").notNull(),
  contentMarkdown: text("contentMarkdown"),
  coverUrl: text("coverUrl"),
  downloadUrl: text("downloadUrl"),
  externalLink: text("externalLink"),
  version: varchar("version", { length: 64 }).default("v0.1-beta").notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  authorName: varchar("authorName", { length: 128 }).default("SmailLabs").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const newsArticles = mysqlTable("news_articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverUrl: text("coverUrl"),
  isPublished: boolean("isPublished").default(true).notNull(),
  authorNick: varchar("authorNick", { length: 64 }).default("YTSmailDog").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const forumCategories = mysqlTable("forum_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  orderIndex: int("orderIndex").default(0).notNull(),
  isLocked: boolean("isLocked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const forumThreads = mysqlTable("forum_threads", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  authorMinecraftNick: varchar("authorMinecraftNick", { length: 64 }),
  isPinned: boolean("isPinned").default(false).notNull(),
  isLocked: boolean("isLocked").default(false).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const forumPosts = mysqlTable("forum_posts", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  authorMinecraftNick: varchar("authorMinecraftNick", { length: 64 }),
  content: text("content").notNull(),
  isReported: boolean("isReported").default(false).notNull(),
  reportReason: text("reportReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const teamApplications = mysqlTable("team_applications", {
  id: int("id").autoincrement().primaryKey(),
  nickname: varchar("nickname", { length: 128 }).notNull(),
  minecraftNick: varchar("minecraftNick", { length: 64 }).notNull(),
  skinSourceType: mysqlEnum("skinSourceType", ["licensed", "tlauncher", "elyby"]).default("licensed").notNull(),
  age: int("age"),
  roleDesired: varchar("roleDesired", { length: 128 }).notNull(),
  contacts: varchar("contacts", { length: 255 }).notNull(),
  portfolioOrExperience: text("portfolioOrExperience").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const uploadedFiles = mysqlTable("uploaded_files", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: text("fileKey").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  sizeBytes: int("sizeBytes").default(0),
  uploadedBy: varchar("uploadedBy", { length: 128 }).default("Admin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const youtubeVideos = mysqlTable("youtube_videos", {
  id: int("id").autoincrement().primaryKey(),
  videoId: varchar("videoId", { length: 32 }).notNull().unique(),
  channelId: varchar("channelId", { length: 64 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  publishedAt: timestamp("publishedAt").notNull(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  videoUrl: text("videoUrl").notNull(),
  durationSeconds: int("durationSeconds"),
  isShort: boolean("isShort").default(false).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  hasApiStats: boolean("hasApiStats").default(false).notNull(),
  discordNotifiedAt: timestamp("discordNotifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
