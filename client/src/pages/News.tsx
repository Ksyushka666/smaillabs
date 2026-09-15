import React from "react";
import { trpc } from "@/lib/trpc";
import { Newspaper, Calendar, User, ExternalLink } from "lucide-react";

export default function News() {
  const { data: news = [], isLoading } = trpc.news.list.useQuery();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-mono uppercase">
          <Newspaper className="w-3.5 h-3.5" />
          Блог и Патчноуты
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-100">Новости SmailLabs</h1>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
          Главные события, обновления проектов, анонсы стримов и набор в бета-тестирование.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm">
          Загрузка новостей...
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm">
          Новостей пока нет.
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-4"
            >
              {item.coverUrl && (
                <div className="h-64 w-full rounded-2xl overflow-hidden bg-zinc-800">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Автор: @{item.authorNick}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-100">{item.title}</h2>

              <p className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                {item.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
