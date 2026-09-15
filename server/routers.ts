import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { getYouTubeOverview, syncYouTubeVideos } from "./youtube";

// Middleware for Admin procedures
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Только администратор имеет доступ к этой функции" });
  }
  return next({ ctx });
});

// Helper for Minecraft skin URL resolution
function getMinecraftSkinData(nick: string, sourceType: "licensed" | "tlauncher") {
  const cleanNick = nick.trim();
  if (sourceType === "licensed") {
    return {
      nick: cleanNick,
      sourceType: "licensed" as const,
      skinTextureUrl: `https://minotar.net/skin/${cleanNick}`,
      head2dUrl: `https://minotar.net/helm/${cleanNick}/128.png`,
      profileUrl: `https://namemc.com/profile/${cleanNick}`,
      sourceName: "NameMC / Mojang (Лицензия)",
    };
  }

  // TLauncher / pirate skin link standard
  const tlauncherSkinUrl = `https://skin.tlauncher.org/upload/profile/skins/${encodeURIComponent(cleanNick)}.png`;
  return {
    nick: cleanNick,
    sourceType: "tlauncher" as const,
    skinTextureUrl: tlauncherSkinUrl,
    head2dUrl: `https://minotar.net/helm/${cleanNick}/128.png`, // fallback head render
    profileUrl: `https://tlauncher.org/ru/skin/${encodeURIComponent(cleanNick)}`,
    sourceName: "TLauncher (Пиратка)",
  };
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          minecraftNick: z.string().optional(),
          minecraftSkinType: z.enum(["licensed", "tlauncher"]).default("licensed"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.upsertUser({
          openId: ctx.user.openId,
          name: input.name ?? ctx.user.name,
          bio: input.bio,
          minecraftNick: input.minecraftNick,
          minecraftSkinType: input.minecraftSkinType,
        });
        return { success: true };
      }),
  }),

  // --- Minecraft skin lookup service ---
  minecraft: router({
    lookup: publicProcedure
      .input(
        z.object({
          nick: z.string().min(1),
          sourceType: z.enum(["licensed", "tlauncher"]).default("licensed"),
        })
      )
      .query(({ input }) => {
        return getMinecraftSkinData(input.nick, input.sourceType);
      }),
  }),

  // --- YouTube RSS feed + optional Data API enrichment ---
  youtube: router({
    overview: publicProcedure
      .input(
        z
          .object({
            limit: z.number().int().min(1).max(24).optional(),
            kind: z.enum(["all", "video", "shorts"]).optional(),
            sort: z.enum(["latest", "popular"]).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getYouTubeOverview(input?.limit || 12, input?.kind || "all", input?.sort || "latest");
      }),
    sync: adminProcedure.mutation(async () => syncYouTubeVideos()),
  }),

  // --- Settings & Visual Customizer ---
  settings: router({
    get: publicProcedure.query(async () => {
      return db.getSiteSettings();
    }),
    update: adminProcedure
      .input(
        z.object({
          title: z.string().optional(),
          tagline: z.string().optional(),
          logoUrl: z.string().optional(),
          youtubeUrl: z.string().optional(),
          discordUrl: z.string().optional(),
          themePreset: z.string().optional(),
          primaryColor: z.string().optional(),
          accentColor: z.string().optional(),
          heroBadgeText: z.string().optional(),
          heroTitle: z.string().optional(),
          heroDescription: z.string().optional(),
          enable3dHeads: z.boolean().optional(),
          layoutConfig: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateSiteSettings(input);
      }),
  }),

  // --- Team Members ---
  team: router({
    list: publicProcedure.query(async () => {
      const members = await db.getTeamMembers();
      return members.map((m) => {
        const meta = getMinecraftSkinData(m.minecraftNick, m.skinSourceType);
        return {
          ...m,
          skinMeta: meta,
        };
      });
    }),
    upsert: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(1),
          roleTitle: z.string().min(1),
          minecraftNick: z.string().min(1),
          skinSourceType: z.enum(["licensed", "tlauncher"]).default("licensed"),
          skinUrl: z.string().optional(),
          bio: z.string().optional(),
          orderIndex: z.number().default(0),
          isBetaTester: z.boolean().default(false),
          youtubeChannel: z.string().optional(),
          discordTag: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.upsertTeamMember(input);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTeamMember(input.id);
      }),
  }),

  // --- Projects ---
  projects: router({
    list: publicProcedure
      .input(z.object({ includeUnpublished: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return db.getProjects(!input?.includeUnpublished);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getProjectBySlug(input.slug);
      }),
    upsert: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(1),
          slug: z.string().min(1),
          category: z.enum(["release", "beta", "in_development"]),
          description: z.string().min(1),
          contentMarkdown: z.string().optional(),
          coverUrl: z.string().optional(),
          downloadUrl: z.string().optional(),
          externalLink: z.string().optional(),
          version: z.string().default("v0.1-beta"),
          isPublished: z.boolean().default(true),
          authorName: z.string().default("SmailLabs"),
        })
      )
      .mutation(async ({ input }) => {
        return db.upsertProject(input);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProject(input.id);
      }),
  }),

  // --- News ---
  news: router({
    list: publicProcedure
      .input(z.object({ includeUnpublished: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return db.getNews(!input?.includeUnpublished);
      }),
    upsert: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(1),
          slug: z.string().min(1),
          excerpt: z.string().min(1),
          content: z.string().min(1),
          coverUrl: z.string().optional(),
          isPublished: z.boolean().default(true),
          authorNick: z.string().default("YTSmailDog"),
        })
      )
      .mutation(async ({ input }) => {
        return db.upsertNews(input);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteNews(input.id);
      }),
  }),

  // --- Forum ---
  forum: router({
    getCategories: publicProcedure.query(async () => {
      return db.getForumCategories();
    }),
    upsertCategory: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          orderIndex: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return db.upsertForumCategory(input);
      }),
    getThreads: publicProcedure
      .input(z.object({ categoryId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getForumThreads(input?.categoryId);
      }),
    getThread: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getForumThread(input.id);
      }),
    createThread: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          title: z.string().min(3),
          content: z.string().min(5),
          authorMinecraftNick: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const authorName = ctx.user.name || "Участник";
        return db.createForumThread(
          {
            categoryId: input.categoryId,
            title: input.title,
            authorName,
            authorMinecraftNick: input.authorMinecraftNick || ctx.user.minecraftNick || null,
          },
          input.content
        );
      }),
    createPost: protectedProcedure
      .input(
        z.object({
          threadId: z.number(),
          content: z.string().min(2),
          authorMinecraftNick: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createForumPost({
          threadId: input.threadId,
          authorName: ctx.user.name || "Участник",
          authorMinecraftNick: input.authorMinecraftNick || ctx.user.minecraftNick || null,
          content: input.content,
        });
      }),
    moderateThread: adminProcedure
      .input(
        z.object({
          id: z.number(),
          isPinned: z.boolean().optional(),
          isLocked: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.moderateForumThread(input.id, {
          isPinned: input.isPinned,
          isLocked: input.isLocked,
        });
      }),
    deleteThread: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteForumThread(input.id);
      }),
    deletePost: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteForumPost(input.id);
      }),
  }),

  // --- Applications to join SmailLabs ---
  applications: router({
    submit: publicProcedure
      .input(
        z.object({
          nickname: z.string().min(2),
          minecraftNick: z.string().min(2),
          skinSourceType: z.enum(["licensed", "tlauncher"]).default("licensed"),
          age: z.number().min(10).max(99).optional(),
          roleDesired: z.string().min(2),
          contacts: z.string().min(3),
          portfolioOrExperience: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        return db.createApplication(input);
      }),
    list: adminProcedure.query(async () => {
      return db.getApplications();
    }),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "accepted", "rejected"]),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateApplicationStatus(input.id, input.status, input.adminNotes);
      }),
  }),

  // --- File Storage Upload from Admin Panel ---
  files: router({
    list: adminProcedure.query(async () => {
      return db.getUploadedFiles();
    }),
    upload: adminProcedure
      .input(
        z.object({
          filename: z.string(),
          contentBase64: z.string(),
          mimeType: z.string().default("application/octet-stream"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.contentBase64, "base64");
        const fileKey = `uploads/${Date.now()}-${input.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.recordUploadedFile({
          filename: input.filename,
          fileKey,
          url,
          mimeType: input.mimeType,
          sizeBytes: buffer.length,
          uploadedBy: ctx.user.name || "Admin",
        });
        return { url, fileKey };
      }),
  }),
});

export type AppRouter = typeof appRouter;
