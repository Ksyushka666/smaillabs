import React from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Clock3, Eye, ExternalLink, ThumbsUp, Youtube } from "lucide-react";

function formatCount(value: number | null | undefined) {
  return new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function YouTube() {
  const { data, isLoading } = trpc.youtube.overview.useQuery({ limit: 12 });
  const stats = data?.settings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <section className="rounded-3xl border border-red-500/25 bg-gradient-to-br from-red-950/30 via-zinc-900/70 to-zinc-950 p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-3 py-1 text-xs font-mono uppercase text-red-300">
              <Youtube className="w-3.5 h-3.5" />
              Автоматическая лента канала
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-100">Видео SmailDog</h1>
            <p className="text-sm leading-relaxed text-zinc-300">
              Свежие ролики автоматически импортируются из RSS-ленты канала, а YouTube Data API добавляет
              просмотры, лайки, комментарии, длительность и актуальную статистику канала.
            </p>
            <a
              href="https://www.youtube.com/@YTSmailDog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-300 hover:text-red-200"
            >
              Открыть канал @YTSmailDog <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3 min-w-full sm:min-w-[380px] lg:min-w-[420px]">
            {[
              ["Подписчики", stats?.youtubeSubscriberCount],
              ["Просмотры", stats?.youtubeChannelViewCount],
              ["Видео", stats?.youtubeVideoCount],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-center">
                <BarChart3 className="w-4 h-4 mx-auto mb-2 text-red-400" />
                <div className="text-xl font-black text-zinc-100">{formatCount(value as number)}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="py-20 text-center text-sm font-mono text-zinc-500">Загрузка видео...</div>
      ) : data?.videos?.length ? (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-red-400">Последние публикации</span>
              <h2 className="mt-1 text-2xl font-black text-zinc-100">Новые видео</h2>
            </div>
            {stats?.youtubeLastSyncedAt && (
              <span className="hidden sm:block text-xs font-mono text-zinc-500">
                Обновлено {new Date(stats.youtubeLastSyncedAt).toLocaleString("ru-RU")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.videos.map((video) => (
              <article key={video.videoId} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-red-500/40 transition-colors">
                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="relative aspect-video overflow-hidden bg-zinc-800">
                    <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {video.durationSeconds && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-mono text-white">
                        {formatDuration(video.durationSeconds)}
                      </span>
                    )}
                  </div>
                </a>
                <div className="space-y-3 p-5">
                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-100">{video.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-mono text-zinc-500">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(video.publishedAt).toLocaleDateString("ru-RU")}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(video.viewCount)}</span>
                    {video.hasApiStats && <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{formatCount(video.likeCount)}</span>}
                  </div>
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-300 hover:text-red-200">
                    Смотреть на YouTube <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <Clock3 className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-400">Лента ещё не синхронизирована. Запустите обновление из админ-панели.</p>
          <Link href="/admin"><Button className="mt-4 bg-red-600 hover:bg-red-500 text-white">Открыть админ-панель</Button></Link>
        </section>
      )}
    </div>
  );
}
