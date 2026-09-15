import React from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Youtube, ExternalLink, Heart, Shield } from "lucide-react";

export const Footer: React.FC = () => {
  const { data: settings } = trpc.settings.get.useQuery();

  return (
    <footer className="mt-auto border-t border-zinc-900 bg-zinc-950/90 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-400">
                {settings?.title || "SmailLabs"}
              </span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                Minecraft Development
              </span>
            </div>
            <p className="text-zinc-400 max-w-sm text-xs leading-relaxed">
              {settings?.tagline ||
                "Официальный портал команды разработки Minecraft-проектов, серверных сборок и бета-тестирования под руководством YTSmailDog."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube @ytsmaildog
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              Разделы
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/projects" className="hover:text-emerald-400 transition-colors">
                  Проекты и Бета-версии
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-emerald-400 transition-colors">
                  Команда и Скины
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-emerald-400 transition-colors">
                  Новости сообщества
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-emerald-400 transition-colors">
                  Форум и Обсуждения
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-emerald-400 transition-colors">
                  Подать заявку в команду
                </Link>
              </li>
            </ul>
          </div>

          {/* Minecraft Account Links */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              Minecraft Интеграции
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://namemc.com/profile/YTSmailDog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                >
                  NameMC (YTSmailDog Лицензия)
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://tlauncher.org/ru/skin/Milyashac_herry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                >
                  TLauncher (Milyashac_herry Пиратка)
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 inline-flex items-center gap-1 transition-colors">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  Управление порталом
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <p>© {new Date().getFullYear()} SmailLabs Team. Все права сохранены.</p>
          <p className="flex items-center gap-1">
            Сделано для Minecraft сообщества с <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
