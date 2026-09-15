import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { eq } from "drizzle-orm";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { syncYouTubeVideos } from "../youtube";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/scheduled/youtube-sync", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }
      const db = await getDb();
      const ownedJob = db
        ? await db
            .select({
              id: siteSettings.id,
              youtubeSyncFrequency: siteSettings.youtubeSyncFrequency,
              youtubeLastSyncedAt: siteSettings.youtubeLastSyncedAt,
            })
            .from(siteSettings)
            .where(eq(siteSettings.youtubeScheduleCronTaskUid, user.taskUid))
            .limit(1)
        : [];
      if (!ownedJob.length) {
        return res.json({ ok: true, skipped: "orphan" });
      }
      const settings = ownedJob[0];
      const frequencySeconds = {
        manual: 0,
        hourly: 60 * 60,
        every_6_hours: 6 * 60 * 60,
        daily: 24 * 60 * 60,
      }[settings.youtubeSyncFrequency as "manual" | "hourly" | "every_6_hours" | "daily"] ?? 24 * 60 * 60;
      if (frequencySeconds === 0) {
        return res.json({ ok: true, skipped: "manual" });
      }
      if (settings.youtubeLastSyncedAt && Date.now() - settings.youtubeLastSyncedAt.getTime() < frequencySeconds * 1000) {
        return res.json({ ok: true, skipped: "not-due", frequency: settings.youtubeSyncFrequency });
      }
      const result = await syncYouTubeVideos();
      return res.json({ ok: true, taskUid: user.taskUid, ...result });
    } catch (error) {
      return res.status(500).json({
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { url: req.originalUrl },
        timestamp: new Date().toISOString(),
      });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
