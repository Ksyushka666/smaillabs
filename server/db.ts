import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  forumCategories,
  forumPosts,
  forumThreads,
  InsertUser,
  newsArticles,
  projects,
  siteSettings,
  teamApplications,
  teamMembers,
  uploadedFiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "minecraftNick", "minecraftSkinUrl", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.minecraftSkinType !== undefined) {
      values.minecraftSkinType = user.minecraftSkinType;
      updateSet.minecraftSkinType = user.minecraftSkinType;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// --- Site Settings ---
export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, "main")).limit(1);
  if (rows.length > 0) return rows[0];

  const initial = {
    key: "main",
    title: "SmailLabs",
    tagline: "Minecraft-разработка, бета-проекты и ламповое комьюнити",
    logoUrl: "https://i.supaimg.com/9e5c2b23-12fe-43f9-940c-6ffbb1de838e/43283e9b-5e5e-4a83-8077-774fce12a394.png",
    youtubeUrl: "https://youtube.com/@ytsmaildog",
    discordUrl: "https://discord.gg/smaillabs",
    themePreset: "emerald-dark",
    primaryColor: "#10b981",
    accentColor: "#3b82f6",
    heroBadgeText: "Команда по Minecraft-контенту",
    heroTitle: "SmailLabs — инновации в Minecraft и вебе",
    heroDescription:
      "Официальный портал команды SmailLabs. Мы создаем смелые Minecraft-проекты, серверные моды, бета-лаунчеры и собираем дружную команду разработчиков, билдеров и тестеров.",
    enable3dHeads: true,
    youtubeSyncFrequency: "daily",
    discordNotificationsEnabled: true,
    discordNotifyShorts: true,
    discordNotificationFormat: "embed",
    layoutConfig: JSON.stringify({
      showHero: true,
      showTeam: true,
      showProjects: true,
      showNews: true,
      showForum: true,
      showApplication: true,
    }),
  };

  await db.insert(siteSettings).values(initial);
  return initial;
}

export async function updateSiteSettings(data: Partial<typeof siteSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await getSiteSettings(); // ensure created
  await db.update(siteSettings).set(data).where(eq(siteSettings.key, "main"));
  return getSiteSettings();
}

// --- Team Members ---
export async function getTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).orderBy(asc(teamMembers.orderIndex), asc(teamMembers.id));
}

export async function upsertTeamMember(data: typeof teamMembers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  if (data.id) {
    await db.update(teamMembers).set(data).where(eq(teamMembers.id, data.id));
    return data.id;
  }
  const result = await db.insert(teamMembers).values(data);
  return result[0].insertId;
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
  return true;
}

// --- Projects ---
export async function getProjects(onlyPublished = true) {
  const db = await getDb();
  if (!db) return [];
  if (onlyPublished) {
    return db.select().from(projects).where(eq(projects.isPublished, true)).orderBy(desc(projects.createdAt));
  }
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0] || null;
}

export async function upsertProject(data: typeof projects.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  if (data.id) {
    await db.update(projects).set(data).where(eq(projects.id, data.id));
    return data.id;
  }
  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.delete(projects).where(eq(projects.id, id));
  return true;
}

// --- News Articles ---
export async function getNews(onlyPublished = true) {
  const db = await getDb();
  if (!db) return [];
  if (onlyPublished) {
    return db.select().from(newsArticles).where(eq(newsArticles.isPublished, true)).orderBy(desc(newsArticles.createdAt));
  }
  return db.select().from(newsArticles).orderBy(desc(newsArticles.createdAt));
}

export async function upsertNews(data: typeof newsArticles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  if (data.id) {
    await db.update(newsArticles).set(data).where(eq(newsArticles.id, data.id));
    return data.id;
  }
  const result = await db.insert(newsArticles).values(data);
  return result[0].insertId;
}

export async function deleteNews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.delete(newsArticles).where(eq(newsArticles.id, id));
  return true;
}

// --- Forum ---
export async function getForumCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forumCategories).orderBy(asc(forumCategories.orderIndex));
}

export async function upsertForumCategory(data: typeof forumCategories.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  if (data.id) {
    await db.update(forumCategories).set(data).where(eq(forumCategories.id, data.id));
    return data.id;
  }
  const result = await db.insert(forumCategories).values(data);
  return result[0].insertId;
}

export async function getForumThreads(categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (categoryId) {
    return db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId))
      .orderBy(desc(forumThreads.isPinned), desc(forumThreads.updatedAt));
  }
  return db.select().from(forumThreads).orderBy(desc(forumThreads.isPinned), desc(forumThreads.updatedAt));
}

export async function getForumThread(id: number) {
  const db = await getDb();
  if (!db) return null;
  const threads = await db.select().from(forumThreads).where(eq(forumThreads.id, id)).limit(1);
  if (threads.length === 0) return null;
  const posts = await db.select().from(forumPosts).where(eq(forumPosts.threadId, id)).orderBy(asc(forumPosts.createdAt));
  return {
    thread: threads[0],
    posts,
  };
}

export async function createForumThread(
  thread: typeof forumThreads.$inferInsert,
  firstPostContent: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  const threadRes = await db.insert(forumThreads).values(thread);
  const threadId = threadRes[0].insertId;
  await db.insert(forumPosts).values({
    threadId,
    authorName: thread.authorName,
    authorMinecraftNick: thread.authorMinecraftNick,
    content: firstPostContent,
  });
  return threadId;
}

export async function createForumPost(post: typeof forumPosts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  const res = await db.insert(forumPosts).values(post);
  await db
    .update(forumThreads)
    .set({ updatedAt: new Date() })
    .where(eq(forumThreads.id, post.threadId));
  return res[0].insertId;
}

export async function moderateForumThread(id: number, updates: { isPinned?: boolean; isLocked?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.update(forumThreads).set(updates).where(eq(forumThreads.id, id));
  return true;
}

export async function deleteForumThread(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.delete(forumPosts).where(eq(forumPosts.threadId, id));
  await db.delete(forumThreads).where(eq(forumThreads.id, id));
  return true;
}

export async function deleteForumPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.delete(forumPosts).where(eq(forumPosts.id, id));
  return true;
}

// --- Applications ---
export async function createApplication(data: typeof teamApplications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  const result = await db.insert(teamApplications).values(data);
  return result[0].insertId;
}

export async function getApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamApplications).orderBy(desc(teamApplications.createdAt));
}

export async function updateApplicationStatus(id: number, status: "pending" | "accepted" | "rejected", adminNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  await db.update(teamApplications).set({ status, adminNotes }).where(eq(teamApplications.id, id));
  return true;
}

// --- Uploaded Files ---
export async function getUploadedFiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(uploadedFiles).orderBy(desc(uploadedFiles.createdAt));
}

export async function recordUploadedFile(file: typeof uploadedFiles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");
  const res = await db.insert(uploadedFiles).values(file);
  return res[0].insertId;
}
