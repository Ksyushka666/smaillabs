import { desc, eq } from "drizzle-orm";
import { youtubeVideos, siteSettings } from "../drizzle/schema";
import { getDb } from "./db";
import { notifyDiscordAboutVideo } from "./discord";

export const YOUTUBE_CHANNEL_ID = "UCHwDOUx1FS4mtwFcZnUGyIg";
export const YOUTUBE_CHANNEL_HANDLE = "@YTSmailDog";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

type RssVideo = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: Date;
  thumbnailUrl: string;
  videoUrl: string;
};

type ApiVideo = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
  };
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
};

type ChannelApiData = {
  snippet?: { title?: string; description?: string; thumbnails?: { high?: { url?: string } } };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
  statistics?: { subscriberCount?: string; viewCount?: string; videoCount?: string };
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function readTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function readAttribute(block: string, tag: string, attribute: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*\\s${attribute}=["']([^"']+)["']`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseRss(xml: string): RssVideo[] {
  return Array.from(xml.matchAll(/<entry>[\s\S]*?<\/entry>/gi)).flatMap((match) => {
    const block = match[0];
    const videoId = readTag(block, "yt:videoId");
    const title = readTag(block, "title");
    const published = readTag(block, "published");
    if (!videoId || !title || !published) return [];
    return [
      {
        videoId,
        title,
        description: readTag(block, "media:description"),
        publishedAt: new Date(published),
        thumbnailUrl:
          readAttribute(block, "media:thumbnail", "url") ||
          `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      },
    ];
  });
}

function parseIsoDuration(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return null;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

export function classifyYouTubeShort(title: string, durationSeconds: number | null): boolean {
  return /#shorts?\b/i.test(title) || (durationSeconds !== null && durationSeconds <= 60);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`YouTube API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function getApiEnrichment(videoIds: string[]) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey || videoIds.length === 0) return new Map<string, ApiVideo>();
  const url = new URL(`${YOUTUBE_API_URL}/videos`);
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", apiKey);
  const data = await fetchJson<{ items?: ApiVideo[] }>(url.toString());
  return new Map((data.items || []).map((item) => [item.id, item]));
}

async function getChannelData() {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) return null;
  const url = new URL(`${YOUTUBE_API_URL}/channels`);
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", YOUTUBE_CHANNEL_ID);
  url.searchParams.set("key", apiKey);
  const data = await fetchJson<{ items?: ChannelApiData[] }>(url.toString());
  const item = data.items?.[0];
  if (!item) return null;
  return item;
}

async function getChannelStats(channel: ChannelApiData | null) {
  if (!channel) return null;
  return {
    title: channel.snippet?.title || "SmailDog",
    description: channel.snippet?.description || null,
    thumbnailUrl: channel.snippet?.thumbnails?.high?.url || null,
    subscriberCount: Number(channel.statistics?.subscriberCount || 0),
    viewCount: Number(channel.statistics?.viewCount || 0),
    videoCount: Number(channel.statistics?.videoCount || 0),
  };
}

async function getUploadsPlaylistVideos(uploadsPlaylistId: string) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) return [] as RssVideo[];
  const url = new URL(`${YOUTUBE_API_URL}/playlistItems`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", uploadsPlaylistId);
  url.searchParams.set("maxResults", "15");
  url.searchParams.set("key", apiKey);
  const data = await fetchJson<{
    items?: Array<{
      contentDetails?: { videoId?: string; videoPublishedAt?: string };
      snippet?: {
        title?: string;
        description?: string;
        publishedAt?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
        resourceId?: { videoId?: string };
      };
    }>;
  }>(url.toString());
  return (data.items || []).flatMap((item) => {
    const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    const published = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
    if (!videoId || !published || !item.snippet?.title) return [];
    return [{
      videoId,
      title: item.snippet.title,
      description: item.snippet.description || "",
      publishedAt: new Date(published),
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    }];
  });
}

export async function syncYouTubeVideos() {
  const db = await getDb();
  if (!db) throw new Error("Database not ready");

  let source: "rss" | "data-api" = "rss";
  let rssVideos: RssVideo[] = [];
  const rssResponse = await fetch(RSS_URL, { headers: { accept: "application/atom+xml" } });
  if (rssResponse.ok) {
    rssVideos = parseRss(await rssResponse.text());
  }
  const channelData = await getChannelData();
  if (rssVideos.length === 0 && channelData?.contentDetails?.relatedPlaylists?.uploads) {
    source = "data-api";
    rssVideos = await getUploadsPlaylistVideos(channelData.contentDetails.relatedPlaylists.uploads);
  }
  if (rssVideos.length === 0) {
    throw new Error(`YouTube sources returned no videos (RSS ${rssResponse.status})`);
  }
  const apiVideos = await getApiEnrichment(rssVideos.map((video) => video.videoId));
  const channelStats = await getChannelStats(channelData);
  let notified = 0;

  for (const rssVideo of rssVideos) {
    const apiVideo = apiVideos.get(rssVideo.videoId);
    const apiSnippet = apiVideo?.snippet;
    const durationSeconds = parseIsoDuration(apiVideo?.contentDetails?.duration);
    const title = apiSnippet?.title || rssVideo.title;
    const isShort = classifyYouTubeShort(title, durationSeconds);
    const existingRows = await db
      .select({ id: youtubeVideos.id, discordNotifiedAt: youtubeVideos.discordNotifiedAt })
      .from(youtubeVideos)
      .where(eq(youtubeVideos.videoId, rssVideo.videoId))
      .limit(1);
    const isNewVideo = existingRows.length === 0;

    await db
      .insert(youtubeVideos)
      .values({
        videoId: rssVideo.videoId,
        channelId: YOUTUBE_CHANNEL_ID,
        title,
        description: apiSnippet?.description || rssVideo.description || "",
        publishedAt: apiSnippet?.publishedAt ? new Date(apiSnippet.publishedAt) : rssVideo.publishedAt,
        thumbnailUrl:
          apiSnippet?.thumbnails?.high?.url ||
          apiSnippet?.thumbnails?.medium?.url ||
          rssVideo.thumbnailUrl,
        videoUrl: rssVideo.videoUrl,
        durationSeconds,
        isShort,
        viewCount: Number(apiVideo?.statistics?.viewCount || 0),
        likeCount: Number(apiVideo?.statistics?.likeCount || 0),
        commentCount: Number(apiVideo?.statistics?.commentCount || 0),
        hasApiStats: Boolean(apiVideo),
      })
      .onDuplicateKeyUpdate({
        set: {
          title,
          description: apiSnippet?.description || rssVideo.description || "",
          publishedAt: apiSnippet?.publishedAt ? new Date(apiSnippet.publishedAt) : rssVideo.publishedAt,
          thumbnailUrl:
            apiSnippet?.thumbnails?.high?.url ||
            apiSnippet?.thumbnails?.medium?.url ||
            rssVideo.thumbnailUrl,
          durationSeconds,
          isShort,
          viewCount: Number(apiVideo?.statistics?.viewCount || 0),
          likeCount: Number(apiVideo?.statistics?.likeCount || 0),
          commentCount: Number(apiVideo?.statistics?.commentCount || 0),
          hasApiStats: Boolean(apiVideo),
        },
      });

    if (isNewVideo && !existingRows[0]?.discordNotifiedAt && process.env.DISCORD_YOUTUBE_WEBHOOK_URL) {
      try {
        await notifyDiscordAboutVideo({
          title,
          videoUrl: rssVideo.videoUrl,
          thumbnailUrl:
            apiSnippet?.thumbnails?.high?.url ||
            apiSnippet?.thumbnails?.medium?.url ||
            rssVideo.thumbnailUrl,
          publishedAt: apiSnippet?.publishedAt ? new Date(apiSnippet.publishedAt) : rssVideo.publishedAt,
          viewCount: Number(apiVideo?.statistics?.viewCount || 0),
          likeCount: Number(apiVideo?.statistics?.likeCount || 0),
          isShort,
        });
        await db
          .update(youtubeVideos)
          .set({ discordNotifiedAt: new Date() })
          .where(eq(youtubeVideos.videoId, rssVideo.videoId));
        notified += 1;
      } catch (error) {
        console.error(`[YouTube] Discord notification failed for ${rssVideo.videoId}:`, error);
      }
    }
  }

  await db
    .update(siteSettings)
    .set({
      youtubeChannelId: YOUTUBE_CHANNEL_ID,
      youtubeChannelHandle: YOUTUBE_CHANNEL_HANDLE,
      youtubeLastSyncedAt: new Date(),
      youtubeLastSyncStatus: "success",
      youtubeLastSyncError: null,
      ...(channelStats
        ? {
            youtubeChannelTitle: channelStats.title,
            youtubeChannelDescription: channelStats.description,
            youtubeChannelThumbnailUrl: channelStats.thumbnailUrl,
            youtubeSubscriberCount: channelStats.subscriberCount,
            youtubeChannelViewCount: channelStats.viewCount,
            youtubeVideoCount: channelStats.videoCount,
          }
        : {}),
    })
    .where(eq(siteSettings.key, "main"));

  return { imported: rssVideos.length, enriched: apiVideos.size, channelStats: Boolean(channelStats), notified, source };
}

export type YouTubeVideoKind = "all" | "video" | "shorts";
export type YouTubeVideoSort = "latest" | "popular";

export async function getYouTubeVideos(
  limit = 12,
  kind: YouTubeVideoKind = "all",
  sort: YouTubeVideoSort = "latest"
) {
  const db = await getDb();
  if (!db) return [];
  const condition = kind === "shorts" ? eq(youtubeVideos.isShort, true) : kind === "video" ? eq(youtubeVideos.isShort, false) : undefined;
  const query = db.select().from(youtubeVideos);
  if (condition) {
    return query.where(condition).orderBy(sort === "popular" ? desc(youtubeVideos.viewCount) : desc(youtubeVideos.publishedAt)).limit(limit);
  }
  return query.orderBy(sort === "popular" ? desc(youtubeVideos.viewCount) : desc(youtubeVideos.publishedAt)).limit(limit);
}

export async function getYouTubeOverview(
  limit = 12,
  kind: YouTubeVideoKind = "all",
  sort: YouTubeVideoSort = "latest"
) {
  const db = await getDb();
  if (!db) return null;
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, "main")).limit(1);
  const videos = await getYouTubeVideos(limit, kind, sort);
  return { settings: settings[0] || null, videos };
}
