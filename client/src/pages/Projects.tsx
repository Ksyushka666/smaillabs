import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Blocks, Download, ExternalLink, Filter, Sparkles } from "lucide-react";

export default function Projects() {
  const { data: projects = [], isLoading } = trpc.projects.list.useQuery();
  const [filter, setFilter] = useState<string>("all");

  const filtered = projects.filter((p) => {
    if (filter === "all") return true;
    return p.category === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-mono uppercase">
          <Blocks className="w-3.5 h-3.5" />
          Каталог разработок
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-100">Проекты SmailLabs</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Карты, игровые режимы, бета-лаунчеры и серверные скрипты от нашей команды.
        </p>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: "all", label: "Все проекты" },
            { id: "beta", label: "Бета-версии" },
            { id: "release", label: "Релизы" },
            { id: "in_development", label: "В разработке" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab.id)}
              className={
                filter === tab.id
                  ? "bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold"
                  : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm">
          Загрузка проектов...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm">
          В данной категории проектов пока нет.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="rounded-3xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all flex flex-col group"
            >
              <div className="h-48 bg-zinc-800 relative overflow-hidden">
                <img
                  src={
                    project.coverUrl ||
                    "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400">
                    {project.version}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase mb-2">
                    <span className="text-emerald-400 font-semibold">{project.category}</span>
                    <span>•</span>
                    <span>Автор: {project.authorName}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">{project.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                  {project.downloadUrl ? (
                    <a
                      href={project.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Скачать
                    </a>
                  ) : (
                    <span className="text-[11px] text-zinc-500 font-mono">Доступ по заявке</span>
                  )}

                  {project.externalLink && (
                    <a
                      href={project.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1"
                    >
                      Сайт проекта <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
