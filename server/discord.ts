type YouTubeNotificationVideo = {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  isShort: boolean;
};

type DiscordNotificationOptions = {
  enabled: boolean;
  notifyShorts: boolean;
  format: "embed" | "text";
};

export async function notifyDiscordAboutVideo(
  video: YouTubeNotificationVideo,
  options: DiscordNotificationOptions = { enabled: true, notifyShorts: true, format: "embed" }
) {
  const webhookUrl = process.env.DISCORD_YOUTUBE_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, skipped: "not-configured" as const };
  if (!options.enabled) return { sent: false, skipped: "disabled" as const };
  if (video.isShort && !options.notifyShorts) return { sent: false, skipped: "shorts-disabled" as const };

  const title = `${video.isShort ? "Новый Shorts" : "Новое видео"}: ${video.title}`;
  const payload =
    options.format === "text"
      ? {
          username: "SmailLabs YouTube",
          content: `${title}\n${video.videoUrl}\nПросмотры: ${video.viewCount.toLocaleString("ru-RU")} • Лайки: ${video.likeCount.toLocaleString("ru-RU")}`,
        }
      : {
          username: "SmailLabs YouTube",
          avatar_url: "https://www.youtube.com/s/desktop/28c7c7e3/img/favicon_144x144.png",
          embeds: [
            {
              title,
              url: video.videoUrl,
              color: video.isShort ? 0xef4444 : 0xdc2626,
              thumbnail: { url: video.thumbnailUrl },
              description: "Свежая публикация на канале @YTSmailDog",
              fields: [
                { name: "Просмотры", value: video.viewCount.toLocaleString("ru-RU"), inline: true },
                { name: "Лайки", value: video.likeCount.toLocaleString("ru-RU"), inline: true },
              ],
              timestamp: video.publishedAt.toISOString(),
              footer: { text: "SmailLabs • YouTube" },
            },
          ],
        };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Discord webhook failed (${response.status})`);
  return { sent: true as const };
}
