import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Minecraft3DHead } from "@/components/Minecraft3DHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Blocks,
  CheckCircle,
  FileUp,
  LayoutTemplate,
  MessageSquare,
  Newspaper,
  Palette,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  XCircle,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Queries
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: team = [] } = trpc.team.list.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery({ includeUnpublished: true });
  const { data: news = [] } = trpc.news.list.useQuery({ includeUnpublished: true });
  const { data: applications = [] } = trpc.applications.list.useQuery();
  const { data: files = [] } = trpc.files.list.useQuery();
  const { data: youtubeOverview } = trpc.youtube.overview.useQuery({ limit: 6 });
  const syncYouTubeMutation = trpc.youtube.sync.useMutation({
    onSuccess: (result) => {
      toast.success(`YouTube обновлён: ${result.imported} видео, ${result.enriched} со статистикой`);
      utils.youtube.overview.invalidate();
    },
    onError: (error) => toast.error(error.message || "Не удалось обновить YouTube"),
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    title: "",
    tagline: "",
    logoUrl: "",
    youtubeUrl: "",
    discordUrl: "",
    youtubeSyncFrequency: "daily" as "manual" | "hourly" | "every_6_hours" | "daily",
    discordNotificationsEnabled: true,
    discordNotifyShorts: true,
    discordNotificationFormat: "embed" as "embed" | "text",
    primaryColor: "#10b981",
    accentColor: "#3b82f6",
    heroBadgeText: "",
    heroTitle: "",
    heroDescription: "",
  });

  React.useEffect(() => {
    if (settings) {
      setSettingsForm({
        title: settings.title,
        tagline: settings.tagline || "",
        logoUrl: settings.logoUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        discordUrl: settings.discordUrl || "",
        youtubeSyncFrequency: (["manual", "hourly", "every_6_hours", "daily"] as const).includes(settings.youtubeSyncFrequency as "manual" | "hourly" | "every_6_hours" | "daily")
          ? (settings.youtubeSyncFrequency as "manual" | "hourly" | "every_6_hours" | "daily")
          : "daily",
        discordNotificationsEnabled: settings.discordNotificationsEnabled,
        discordNotifyShorts: settings.discordNotifyShorts,
        discordNotificationFormat: settings.discordNotificationFormat === "text" ? "text" : "embed",
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        heroBadgeText: settings.heroBadgeText || "",
        heroTitle: settings.heroTitle || "",
        heroDescription: settings.heroDescription || "",
      });
    }
  }, [settings]);

  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Настройки сайта сохранены!");
      utils.settings.get.invalidate();
    },
  });

  // Team Form State
  const [teamForm, setTeamForm] = useState({
    id: undefined as number | undefined,
    name: "",
    roleTitle: "",
    minecraftNick: "",
    skinSourceType: "licensed" as "licensed" | "tlauncher",
    bio: "",
    isBetaTester: false,
    orderIndex: 0,
  });

  const upsertTeamMutation = trpc.team.upsert.useMutation({
    onSuccess: () => {
      toast.success("Участник сохранен!");
      setTeamForm({
        id: undefined,
        name: "",
        roleTitle: "",
        minecraftNick: "",
        skinSourceType: "licensed",
        bio: "",
        isBetaTester: false,
        orderIndex: 0,
      });
      utils.team.list.invalidate();
    },
  });

  const deleteTeamMutation = trpc.team.delete.useMutation({
    onSuccess: () => {
      toast.success("Участник удален");
      utils.team.list.invalidate();
    },
  });

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    id: undefined as number | undefined,
    title: "",
    slug: "",
    category: "beta" as "release" | "beta" | "in_development",
    version: "v0.1-beta",
    description: "",
    coverUrl: "",
    downloadUrl: "",
    externalLink: "",
    authorName: "SmailLabs",
  });

  const upsertProjectMutation = trpc.projects.upsert.useMutation({
    onSuccess: () => {
      toast.success("Проект сохранен!");
      setProjectForm({
        id: undefined,
        title: "",
        slug: "",
        category: "beta",
        version: "v0.1-beta",
        description: "",
        coverUrl: "",
        downloadUrl: "",
        externalLink: "",
        authorName: "SmailLabs",
      });
      utils.projects.list.invalidate();
    },
  });

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Проект удален");
      utils.projects.list.invalidate();
    },
  });

  // News Form State
  const [newsForm, setNewsForm] = useState({
    id: undefined as number | undefined,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    authorNick: "YTSmailDog",
  });

  const upsertNewsMutation = trpc.news.upsert.useMutation({
    onSuccess: () => {
      toast.success("Новость сохранена!");
      setNewsForm({
        id: undefined,
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverUrl: "",
        authorNick: "YTSmailDog",
      });
      utils.news.list.invalidate();
    },
  });

  const deleteNewsMutation = trpc.news.delete.useMutation({
    onSuccess: () => {
      toast.success("Новость удалена");
      utils.news.list.invalidate();
    },
  });

  // Application Status Mutation
  const updateAppMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Статус заявки обновлен");
      utils.applications.list.invalidate();
    },
  });

  // File Upload State
  const [uploadLoading, setUploadLoading] = useState(false);
  const uploadFileMutation = trpc.files.upload.useMutation({
    onSuccess: (data) => {
      toast.success("Файл успешно загружен в хранилище!");
      setUploadLoading(false);
      utils.files.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Ошибка загрузки файла");
      setUploadLoading(false);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadFileMutation.mutate({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-xs font-mono uppercase">
            <Shield className="w-3.5 h-3.5" />
            Панель управления SmailLabs
          </div>
          <h1 className="text-3xl font-black text-zinc-100 mt-2">Визуальная Админ-панель</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Полный контроль над сайтом: плашки, тексты, кнопки, темы, 3D головы и заявки
          </p>
        </div>
      </div>

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex-wrap">
          <TabsTrigger value="visual" className="gap-2 text-xs">
            <Palette className="w-3.5 h-3.5" />
            Внешний вид и Тексты
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 text-xs">
            <Users className="w-3.5 h-3.5" />
            Команда и Скины
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2 text-xs">
            <Blocks className="w-3.5 h-3.5" />
            Проекты
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-2 text-xs">
            <Newspaper className="w-3.5 h-3.5" />
            Новости
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            Заявки ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2 text-xs">
            <FileUp className="w-3.5 h-3.5" />
            Файлы и Storage
          </TabsTrigger>
          <TabsTrigger value="youtube" className="gap-2 text-xs">
            <Youtube className="w-3.5 h-3.5" />
            YouTube
          </TabsTrigger>
        </TabsList>

        {/* --- Tab 1: Visual Settings & Layout --- */}
        <TabsContent value="visual">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-zinc-100">Настройки плашек, текстов и кнопок</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Название портала</label>
                  <Input
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Текст бейджа в шапке</label>
                  <Input
                    value={settingsForm.heroBadgeText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadgeText: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Главный заголовок (Hero Title)</label>
                  <Input
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Описание Hero блока</label>
                  <Textarea
                    rows={3}
                    value={settingsForm.heroDescription}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroDescription: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">YouTube URL</label>
                    <Input
                      value={settingsForm.youtubeUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Discord URL</label>
                    <Input
                      value={settingsForm.discordUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, discordUrl: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Ссылка на логотип</label>
                  <Input
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <Button
                  onClick={() => updateSettingsMutation.mutate(settingsForm)}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  {updateSettingsMutation.isPending ? "Сохранение..." : "Сохранить внешний вид"}
                </Button>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                Live Preview карточки
              </span>
              <div className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  {settingsForm.heroBadgeText || "Бейдж"}
                </span>
                <h4 className="text-xl font-black text-zinc-100">
                  {settingsForm.heroTitle || "Заголовок"}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {settingsForm.heroDescription || "Текст описания..."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="bg-emerald-600 text-zinc-950 font-bold h-8 text-xs">
                    Кнопка действия
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- Tab 2: Team Members & Minecraft Skins --- */}
        <TabsContent value="team">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Upsert Team Member Form */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-zinc-100">
                {teamForm.id ? "Редактировать участника" : "Добавить участника команды"}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Имя / Псевдоним</label>
                  <Input
                    placeholder="Например: Smail"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Должность в команде</label>
                  <Input
                    placeholder="Основатель / Главный разработчик"
                    value={teamForm.roleTitle}
                    onChange={(e) => setTeamForm({ ...teamForm, roleTitle: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Ник в Minecraft</label>
                    <Input
                      placeholder="YTSmailDog"
                      value={teamForm.minecraftNick}
                      onChange={(e) => setTeamForm({ ...teamForm, minecraftNick: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Тип скина</label>
                    <select
                      value={teamForm.skinSourceType}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, skinSourceType: e.target.value as "licensed" | "tlauncher" })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200"
                    >
                      <option value="licensed">Лицензия (NameMC)</option>
                      <option value="tlauncher">Пиратка (TLauncher)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="betaTesterCheck"
                    checked={teamForm.isBetaTester}
                    onChange={(e) => setTeamForm({ ...teamForm, isBetaTester: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-zinc-950 border-zinc-800"
                  />
                  <label htmlFor="betaTesterCheck" className="text-xs text-zinc-300 font-mono">
                    Отметить как Бета-тестера
                  </label>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Краткое био</label>
                  <Textarea
                    rows={2}
                    placeholder="О себе и задачах..."
                    value={teamForm.bio}
                    onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                {/* 3D Head Real-time preview */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                  <Minecraft3DHead
                    nick={teamForm.minecraftNick || "Steve"}
                    sourceType={teamForm.skinSourceType}
                    size={80}
                  />
                </div>

                <Button
                  onClick={() => upsertTeamMutation.mutate(teamForm)}
                  disabled={upsertTeamMutation.isPending || !teamForm.name || !teamForm.minecraftNick}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  {teamForm.id ? "Обновить данные" : "Добавить в команду"}
                </Button>
              </div>
            </div>

            {/* Existing Team Members List */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-lg font-bold text-zinc-100">Текущий состав ({team.length})</h3>
              <div className="space-y-2">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://minotar.net/helm/${encodeURIComponent(member.minecraftNick)}/48.png`}
                        alt=""
                        className="w-10 h-10 rounded-lg border border-emerald-500/30"
                      />
                      <div>
                        <div className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                          <span>{member.name}</span>
                          {member.isBetaTester && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                              Тестер
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-emerald-400 font-mono">
                          {member.roleTitle} • Ник: {member.minecraftNick} ({member.skinSourceType})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setTeamForm({
                            id: member.id,
                            name: member.name,
                            roleTitle: member.roleTitle,
                            minecraftNick: member.minecraftNick,
                            skinSourceType: member.skinSourceType as any,
                            bio: member.bio || "",
                            isBetaTester: member.isBetaTester,
                            orderIndex: member.orderIndex,
                          })
                        }
                        className="text-xs border-zinc-700 h-8"
                      >
                        Изменить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTeamMutation.mutate({ id: member.id })}
                        className="h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- Tab 3: Projects CRUD --- */}
        <TabsContent value="projects">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-zinc-100">
                {projectForm.id ? "Редактировать проект" : "Добавить новый проект"}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Название проекта</label>
                  <Input
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Slug (URL)</label>
                    <Input
                      value={projectForm.slug}
                      onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Категория</label>
                    <select
                      value={projectForm.category}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, category: e.target.value as any })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200"
                    >
                      <option value="beta">Бета-версия</option>
                      <option value="release">Релиз</option>
                      <option value="in_development">В разработке</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Версия</label>
                  <Input
                    value={projectForm.version}
                    onChange={(e) => setProjectForm({ ...projectForm, version: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Ссылка на скачивание</label>
                  <Input
                    placeholder="https://..."
                    value={projectForm.downloadUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, downloadUrl: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Описание</label>
                  <Textarea
                    rows={4}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <Button
                  onClick={() => upsertProjectMutation.mutate(projectForm)}
                  disabled={upsertProjectMutation.isPending || !projectForm.title || !projectForm.slug}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  {projectForm.id ? "Обновить проект" : "Опубликовать проект"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-lg font-bold text-zinc-100">Все проекты ({projects.length})</h3>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-zinc-100 text-sm">{proj.title}</h4>
                      <p className="text-xs text-zinc-400 font-mono">
                        {proj.category} • {proj.version}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setProjectForm({
                            id: proj.id,
                            title: proj.title,
                            slug: proj.slug,
                            category: proj.category as any,
                            version: proj.version,
                            description: proj.description,
                            coverUrl: proj.coverUrl || "",
                            downloadUrl: proj.downloadUrl || "",
                            externalLink: proj.externalLink || "",
                            authorName: proj.authorName,
                          })
                        }
                        className="text-xs border-zinc-700 h-8"
                      >
                        Изменить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProjectMutation.mutate({ id: proj.id })}
                        className="h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- Tab 4: News Articles --- */}
        <TabsContent value="news">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-zinc-100">
                {newsForm.id ? "Редактировать новость" : "Написать новость"}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Заголовок</label>
                  <Input
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Slug</label>
                  <Input
                    value={newsForm.slug}
                    onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Краткий анонс</label>
                  <Input
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Полный текст</label>
                  <Textarea
                    rows={5}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
                <Button
                  onClick={() => upsertNewsMutation.mutate(newsForm)}
                  disabled={upsertNewsMutation.isPending || !newsForm.title || !newsForm.slug}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  {newsForm.id ? "Обновить новость" : "Опубликовать новость"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-lg font-bold text-zinc-100">Опубликованные новости ({news.length})</h3>
              <div className="space-y-2">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-zinc-100 text-sm">{item.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-1">{item.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setNewsForm({
                            id: item.id,
                            title: item.title,
                            slug: item.slug,
                            excerpt: item.excerpt,
                            content: item.content,
                            coverUrl: item.coverUrl || "",
                            authorNick: item.authorNick,
                          })
                        }
                        className="text-xs border-zinc-700 h-8"
                      >
                        Изменить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteNewsMutation.mutate({ id: item.id })}
                        className="h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- Tab 5: Applications --- */}
        <TabsContent value="applications">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">
              Поступившие заявки в команду ({applications.length})
            </h3>
            {applications.length === 0 ? (
              <p className="text-zinc-500 font-mono text-xs">Заявок пока нет</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://minotar.net/helm/${encodeURIComponent(app.minecraftNick)}/48.png`}
                          alt=""
                          className="w-10 h-10 rounded-lg border border-emerald-500/30"
                        />
                        <div>
                          <div className="font-bold text-zinc-100">{app.nickname}</div>
                          <div className="text-xs text-emerald-400 font-mono">
                            Minecraft: {app.minecraftNick} ({app.skinSourceType}) • Роль: {app.roleDesired}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-mono uppercase ${
                            app.status === "accepted"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : app.status === "rejected"
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {app.status === "accepted"
                            ? "Принят"
                            : app.status === "rejected"
                            ? "Отклонен"
                            : "На рассмотрении"}
                        </span>

                        <Button
                          size="sm"
                          onClick={() => updateAppMutation.mutate({ id: app.id, status: "accepted" })}
                          className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold h-7 text-xs"
                        >
                          Принять
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppMutation.mutate({ id: app.id, status: "rejected" })}
                          className="h-7 text-xs"
                        >
                          Отклонить
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500 font-mono block">Контакты:</span>
                        <span className="text-zinc-200">{app.contacts}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-mono block">Возраст:</span>
                        <span className="text-zinc-200">{app.age || "Не указан"}</span>
                      </div>
                    </div>

                    <div className="text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 font-mono block mb-1">Опыт и портфолио:</span>
                      <p className="text-zinc-300 whitespace-pre-line">{app.portfolioOrExperience}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- Tab 6: File Storage Upload --- */}
        <TabsContent value="files">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Загрузка файлов в хранилище (Storage)</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Загружайте скриншоты, сборки, моды и аватары напрямую в S3 хранилище
              </p>
            </div>

            <div className="p-8 border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center space-y-3 bg-zinc-950/40">
              <FileUp className="w-10 h-10 text-emerald-400" />
              <div className="text-center">
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors inline-block">
                  {uploadLoading ? "Загрузка..." : "Выбрать файл для загрузки"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadLoading}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-zinc-300">Загруженные файлы ({files.length})</h4>
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-200">{f.filename}</div>
                      <div className="text-zinc-500 font-mono text-[11px]">{f.url}</div>
                    </div>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-mono"
                    >
                      Открыть →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- Tab 7: YouTube RSS + Data API --- */}
        <TabsContent value="youtube">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Синхронизация YouTube</h3>
                  <p className="text-xs text-zinc-500 font-mono">@YTSmailDog</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-zinc-400">
                RSS импортирует свежие публикации, а серверный YouTube Data API добавляет превью высокого качества,
                просмотры, лайки, комментарии, длительность и статистику канала.
              </p>
              <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Частота синхронизации</label>
                  <select
                    value={settingsForm.youtubeSyncFrequency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, youtubeSyncFrequency: e.target.value as typeof settingsForm.youtubeSyncFrequency })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                  >
                    <option value="manual">Только вручную</option>
                    <option value="hourly">Каждый час</option>
                    <option value="every_6_hours">Каждые 6 часов</option>
                    <option value="daily">Раз в день</option>
                  </select>
                </div>
                <div className="space-y-3 text-sm text-zinc-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settingsForm.discordNotificationsEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, discordNotificationsEnabled: e.target.checked })} className="accent-red-500" />
                    Отправлять уведомления в Discord
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settingsForm.discordNotifyShorts} onChange={(e) => setSettingsForm({ ...settingsForm, discordNotifyShorts: e.target.checked })} className="accent-red-500" />
                    Уведомлять о Shorts
                  </label>
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Формат уведомления</label>
                  <select
                    value={settingsForm.discordNotificationFormat}
                    onChange={(e) => setSettingsForm({ ...settingsForm, discordNotificationFormat: e.target.value as typeof settingsForm.discordNotificationFormat })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                  >
                    <option value="embed">Красивый Embed с превью</option>
                    <option value="text">Короткое текстовое сообщение</option>
                  </select>
                </div>
                <Button
                  onClick={() => updateSettingsMutation.mutate({
                    youtubeSyncFrequency: settingsForm.youtubeSyncFrequency,
                    discordNotificationsEnabled: settingsForm.discordNotificationsEnabled,
                    discordNotifyShorts: settingsForm.discordNotifyShorts,
                    discordNotificationFormat: settingsForm.discordNotificationFormat,
                  })}
                  disabled={updateSettingsMutation.isPending}
                  variant="outline"
                  className="w-full border-red-500/40 text-red-300 hover:bg-red-950/30"
                >
                  {updateSettingsMutation.isPending ? "Сохранение..." : "Сохранить настройки YouTube и Discord"}
                </Button>
              </div>
              <Button
                onClick={() => syncYouTubeMutation.mutate()}
                disabled={syncYouTubeMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncYouTubeMutation.isPending ? "animate-spin" : ""}`} />
                {syncYouTubeMutation.isPending ? "Синхронизация..." : "Обновить сейчас"}
              </Button>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-mono text-zinc-500 space-y-1">
                <div>Канал: {youtubeOverview?.settings?.youtubeChannelId || "не синхронизирован"}</div>
                <div>Статус: {youtubeOverview?.settings?.youtubeLastSyncStatus || "ожидает запуска"}</div>
                <div>Видео в базе: {youtubeOverview?.videos?.length || 0}</div>
                <div>API-статистика: {youtubeOverview?.videos?.filter((video) => video.hasApiStats).length || 0}</div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-lg font-bold text-zinc-100">Последние импортированные видео</h3>
              <div className="space-y-2">
                {(youtubeOverview?.videos || []).map((video) => (
                  <a key={video.videoId} href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-red-500/40 flex gap-3 items-center">
                    <img src={video.thumbnailUrl} alt="" className="w-28 aspect-video rounded-lg object-cover bg-zinc-800" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-zinc-100 line-clamp-2">{video.title}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">{video.viewCount.toLocaleString("ru-RU")} просмотров {video.hasApiStats ? "• API OK" : "• RSS"}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
