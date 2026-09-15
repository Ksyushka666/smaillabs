import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Compass, Flame, LayoutDashboard, LogIn, LogOut, MessageSquare, Shield, Users, Youtube } from "lucide-react";

export const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery();

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/projects", label: "Проекты" },
    { href: "/team", label: "Команда" },
    { href: "/news", label: "Новости" },
    { href: "/youtube", label: "YouTube" },
    { href: "/forum", label: "Форум" },
    { href: "/apply", label: "Вступить в команду" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-emerald-950/60 shadow-lg shadow-emerald-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 bg-zinc-900 flex items-center justify-center shadow-emerald-500/10 shadow-lg group-hover:scale-105 transition-transform">
            <img
              src={
                settings?.logoUrl ||
                "https://i.supaimg.com/9e5c2b23-12fe-43f9-940c-6ffbb1de838e/43283e9b-5e5e-4a83-8077-774fce12a394.png"
              }
              alt="SmailLabs Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500">
              {settings?.title || "SmailLabs"}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
              Minecraft Beta
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                    : "text-zinc-300 hover:text-emerald-300 hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions (YouTube, Discord, Admin, Auth) */}
        <div className="flex items-center gap-2">
          {settings?.youtubeUrl && (
            <a
              href={settings.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
              title="YouTube Канал YTSmailDog"
            >
              <Youtube className="w-5 h-5" />
            </a>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Админ-панель
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono hidden lg:inline">
                {user?.name || "Пользователь"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="text-xs border-zinc-800 hover:bg-zinc-900 text-zinc-300"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Выйти
              </Button>
            </div>
          ) : (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
