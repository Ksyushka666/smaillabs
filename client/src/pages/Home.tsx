import React, { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Minecraft3DHead } from "@/components/Minecraft3DHead";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  ExternalLink,
  Flame,
  MessageSquare,
  Newspaper,
  ShieldAlert,
  Sparkles,
  Users,
  Youtube,
} from "lucide-react";

export default function Home() {
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: team = [] } = trpc.team.list.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const { data: news = [] } = trpc.news.list.useQuery();
  const youtubeQueryInput = useMemo(() => ({ limit: 3, kind: "all" as const, sort: "latest" as const }), []);
  const { data: youtubeOverview } = trpc.youtube.overview.useQuery(youtubeQueryInput);

  // Founder and lead tester priority heads
  const leadMember = team.find((m) => m.minecraftNick.toLowerCase() === "ytsmaildog") || team[0];
  const betaTesterMember = team.find((m) => m.isBetaTester || m.minecraftNick.toLowerCase().includes("milya"));

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-emerald-950/40 bg-radial from-emerald-950/30 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#052e1615_1px,transparent_1px),linear-gradient(to_bottom,#052e1615_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{settings?.heroBadgeText || "Команда разработки и бета-проектов"}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 leading-[1.1]">
                {settings?.heroTitle || "SmailLabs — инновации в Minecraft и вебе"}
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                {settings?.heroDescription ||
                  "Создаем серверные плагины, карты, моды и бета-проекты. Присоединяйтесь к нашей команде или следите за разработкой на YouTube!"}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/projects">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold px-6 h-12 shadow-lg shadow-emerald-600/20">
                    <Blocks className="w-4 h-4 mr-2" />
                    Наши Проекты
                  </Button>
                </Link>

                <Link href="/apply">
                  <Button variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30 h-12 px-6">
                    Вступить в команду
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                {settings?.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 h-12 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-sm font-semibold transition-colors"
                  >
                    <Youtube className="w-4 h-4 text-red-500" />
                    YouTube Канал
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: 3D Minecraft Heads Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="p-8 rounded-3xl bg-zinc-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl relative group">
                <div className="text-center mb-6">
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
                    3D Интерактивные Головы
                  </span>
                  <h3 className="text-xl font-bold text-zinc-100 mt-1">Основатели и Тестеры</h3>
                  <p className="text-xs text-zinc-400">Покрутите курсором мыши, чтобы рассмотреть скин</p>
                </div>

                <div className="grid grid-cols-2 gap-8 items-center justify-center">
                  {/* YTSmailDog head */}
                  <Minecraft3DHead
                    nick={leadMember ? leadMember.minecraftNick : "YTSmailDog"}
                    sourceType={leadMember ? (leadMember.skinSourceType as any) : "licensed"}
                    size={110}
                    subTitle={leadMember ? leadMember.roleTitle : "Основатель / Lead Dev"}
                  />

                  {/* Milyashac_herry head */}
                  <Minecraft3DHead
                    nick={betaTesterMember ? betaTesterMember.minecraftNick : "Milyashac_herry"}
                    sourceType={betaTesterMember ? (betaTesterMember.skinSourceType as any) : "tlauncher"}
                    size={110}
                    subTitle={betaTesterMember ? betaTesterMember.roleTitle : "Бета-тестер"}
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400">
                    Поддерживаются реальные скины Mojang (NameMC) и TLauncher
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Minecraft Участники
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-100 mt-1">Команда SmailLabs</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Реальные скины участников с быстрыми ссылками на NameMC и TLauncher
            </p>
          </div>
          <Link href="/team" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1">
            Все участники ({team.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.id}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="flex justify-center mb-4">
                <Minecraft3DHead
                  nick={member.minecraftNick}
                  sourceType={member.skinSourceType as any}
                  size={90}
                  showProfileLink={false}
                />
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-bold text-zinc-100 text-base">{member.name}</h4>
                <p className="text-xs text-emerald-400 font-medium">{member.roleTitle}</p>
                {member.isBetaTester && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                    Бета-тестер
                  </span>
                )}
                {member.bio && <p className="text-xs text-zinc-400 pt-2 line-clamp-2">{member.bio}</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-center gap-2">
                <a
                  href={
                    member.skinSourceType === "licensed"
                      ? `https://namemc.com/profile/${encodeURIComponent(member.minecraftNick)}`
                      : `https://tlauncher.org/ru/skin/${encodeURIComponent(member.minecraftNick)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1"
                >
                  <span>{member.minecraftNick}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Разработка
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-100 mt-1">Проекты и Бета-версии</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Наши карты, серверные плагины, моды и экспериментальные сборки
            </p>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1">
            Смотреть все проекты <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all flex flex-col"
            >
              <div className="h-44 bg-zinc-800 relative overflow-hidden">
                <img
                  src={
                    project.coverUrl ||
                    "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400">
                    {project.version}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 mb-2">{project.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-mono">
                    {project.category}
                  </span>
                  <Link
                    href={`/projects`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    Подробнее <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest YouTube Videos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-red-400">YouTube @YTSmailDog</span>
            <h2 className="text-3xl font-extrabold text-zinc-100 mt-1">Последние видео</h2>
            <p className="text-zinc-400 text-sm mt-1">Свежие публикации с превью и статистикой просмотров</p>
          </div>
          <Link href="/youtube" className="text-sm font-semibold text-red-300 hover:text-red-200 inline-flex items-center gap-1">
            Все видео <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {youtubeOverview?.videos?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {youtubeOverview.videos.map((video) => (
              <a key={video.videoId} href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-red-500/40 transition-colors">
                <div className="relative aspect-video overflow-hidden bg-zinc-800">
                  <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-mono font-bold text-white">
                    {video.isShort ? "SHORTS" : "ВИДЕО"}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-100 group-hover:text-red-200">{video.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span>{new Date(video.publishedAt).toLocaleDateString("ru-RU")}</span>
                    <span>•</span>
                    <span>{video.viewCount.toLocaleString("ru-RU")} просмотров</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
            Лента YouTube появится после первой синхронизации.
          </div>
        )}
      </section>

      {/* News & Community Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Latest News */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-zinc-100">Новости и Обновления</h3>
              </div>
              <Link href="/news" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Все новости
              </Link>
            </div>

            <div className="space-y-4">
              {news.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row gap-4 items-start"
                >
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full sm:w-36 h-24 object-cover rounded-xl"
                    />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                      <span>{new Date(item.createdAt).toLocaleDateString("ru-RU")}</span>
                      <span>•</span>
                      <span className="text-emerald-400">@{item.authorNick}</span>
                    </div>
                    <h4 className="text-base font-bold text-zinc-100">{item.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Join SmailLabs CTA Card */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-500/30 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Ищем разработчиков и тестеров!</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Хотите создавать Minecraft проекты вместе с SmailLabs? Заполните заявку, укажите ваш ник и скины (Mojang/TLauncher).
              </p>
            </div>

            <div className="pt-6">
              <Link href="/apply">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">
                  Заполнить заявку
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
