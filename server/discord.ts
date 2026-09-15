type YouTubeNotificationVideo = {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  isShort: boolean;
};

export async function notifyDiscordAboutVideo(video: YouTubeNotificationVideo) {
  const webhookUrl = process.env.DISCORD_YOUTUBE_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, skipped: "not-configured" as const };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "SmailLabs YouTube",
      avatar_url: "https://www.youtube.com/s/desktop/28c7c7e3/img/favicon_144x144.png",
      embeds: [
        {
          title: `${video.isShort ? "Новый Shorts" : "Новое видео"}: ${video.title}`,
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed (${response.status})`);
  }
  return { sent: true as const };
}
