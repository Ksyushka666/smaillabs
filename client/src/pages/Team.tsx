import React from "react";
import { trpc } from "@/lib/trpc";
import { Minecraft3DHead } from "@/components/Minecraft3DHead";
import { ExternalLink, Sparkles, Users } from "lucide-react";

export default function Team() {
  const { data: team = [], isLoading } = trpc.team.list.useQuery();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-950/40 text-orange-400 text-xs font-mono uppercase">
          <Users className="w-3.5 h-3.5" />
          Minecraft Состав
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-100">Команда SmailLabs</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Каждый участник представлен интерактивной 3D-головой со своим реальным скином. Клик по нику открывает профиль игрока на NameMC, Ely.by или TLauncher.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm">
          Загрузка участников команды...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="p-5 sm:p-6 lg:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-orange-500/40 transition-all hover:-translate-y-1 group flex flex-col items-center text-center space-y-4 overflow-hidden"
            >
              {/* 3D Minecraft Head */}
              <div className="py-2">
                <Minecraft3DHead
                  nick={member.minecraftNick}
                  sourceType={member.skinSourceType as any}
                  size={120}
                  interactive={true}
                  showProfileLink={false}
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-100">{member.name}</h3>
                <p className="text-sm text-orange-400 font-semibold">{member.roleTitle}</p>
                {member.isBetaTester && (
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                    ⭐ Бета-тестер
                  </span>
                )}
              </div>

              {member.bio && (
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">{member.bio}</p>
              )}

              {/* Direct links to player skin profile */}
              <div className="pt-4 border-t border-zinc-800 w-full flex flex-col items-center gap-2">
                <a
                  href={member.skinSourceType === "licensed"
                    ? `https://namemc.com/profile/${encodeURIComponent(member.minecraftNick)}`
                    : member.skinSourceType === "elyby"
                      ? `https://ely.by/${encodeURIComponent(member.minecraftNick)}`
                      : `https://tlauncher.org/ru/skin/${encodeURIComponent(member.minecraftNick)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-900/50 border border-orange-500/30 text-orange-300 text-xs font-semibold transition-colors"
                >
                  <span>Профиль Minecraft: {member.minecraftNick}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <span className="text-[10px] text-zinc-500 font-mono uppercase">
                  {member.skinSourceType === "licensed"
                    ? "Лицензия Mojang / NameMC"
                    : member.skinSourceType === "elyby"
                      ? "Ely.by / Живая текстура кожи"
                      : "Пиратка / База скинов TLauncher"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
