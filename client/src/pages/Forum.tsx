import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Pin, Lock, Plus, User, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Forum() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: categories = [] } = trpc.forum.getCategories.useQuery();
  const [selectedCat, setSelectedCat] = useState<number | undefined>(undefined);
  const { data: threads = [] } = trpc.forum.getThreads.useQuery({ categoryId: selectedCat });

  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const { data: activeThreadData } = trpc.forum.getThread.useQuery(
    { id: activeThreadId! },
    { enabled: !!activeThreadId }
  );

  // New Thread Modal
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadContent, setThreadContent] = useState("");
  const [targetCategory, setTargetCategory] = useState<number>(1);

  // New Reply
  const [replyContent, setReplyContent] = useState("");

  const createThreadMutation = trpc.forum.createThread.useMutation({
    onSuccess: () => {
      toast.success("Тема успешно создана!");
      setNewThreadOpen(false);
      setThreadTitle("");
      setThreadContent("");
      utils.forum.getThreads.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Ошибка при создании темы");
    },
  });

  const createReplyMutation = trpc.forum.createPost.useMutation({
    onSuccess: () => {
      toast.success("Ответ опубликован!");
      setReplyContent("");
      utils.forum.getThread.invalidate({ id: activeThreadId! });
      utils.forum.getThreads.invalidate();
    },
  });

  const moderateThreadMutation = trpc.forum.moderateThread.useMutation({
    onSuccess: () => {
      toast.success("Тема обновлена!");
      utils.forum.getThreads.invalidate();
      if (activeThreadId) utils.forum.getThread.invalidate({ id: activeThreadId });
    },
  });

  const deleteThreadMutation = trpc.forum.deleteThread.useMutation({
    onSuccess: () => {
      toast.success("Тема удалена");
      setActiveThreadId(null);
      utils.forum.getThreads.invalidate();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Forum Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-950/40 text-orange-400 text-xs font-mono uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            Комьюнити Форум
          </div>
          <h1 className="text-3xl font-black text-zinc-100 mt-2">Обсуждения SmailLabs</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Предложения по модам, багрепорты, общение игроков и новости обновлений
          </p>
        </div>

        <div>
          {isAuthenticated ? (
            <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-500 text-zinc-950 font-bold">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Создать тему
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
                <DialogHeader>
                  <DialogTitle>Новая тема на форуме</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-zinc-400 font-mono mb-1 block">Категория</label>
                    <select
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200"
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(Number(e.target.value))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-mono mb-1 block">Заголовок темы</label>
                    <Input
                      placeholder="Например: Предложение нового плагина на сервер"
                      value={threadTitle}
                      onChange={(e) => setThreadTitle(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-mono mb-1 block">Содержимое</label>
                    <Textarea
                      rows={5}
                      placeholder="Опишите ваше предложение или вопрос..."
                      value={threadContent}
                      onChange={(e) => setThreadContent(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-zinc-200"
                    />
                  </div>
                  <Button
                    onClick={() =>
                      createThreadMutation.mutate({
                        categoryId: targetCategory || (categories[0]?.id ?? 1),
                        title: threadTitle,
                        content: threadContent,
                      })
                    }
                    disabled={createThreadMutation.isPending || !threadTitle || !threadContent}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-zinc-950 font-bold"
                  >
                    {createThreadMutation.isPending ? "Публикация..." : "Опубликовать тему"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <span className="text-xs text-zinc-500 font-mono">Войдите, чтобы создавать темы</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-xs font-mono uppercase text-zinc-400 px-2 tracking-wider">Категории</h3>
          <button
            onClick={() => {
              setSelectedCat(undefined);
              setActiveThreadId(null);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCat === undefined
                ? "bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Все темы
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.id);
                setActiveThreadId(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCat === cat.id
                  ? "bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <div className="font-medium">{cat.name}</div>
              {cat.description && (
                <div className="text-[11px] text-zinc-500 line-clamp-1">{cat.description}</div>
              )}
            </button>
          ))}
        </div>

        {/* Threads List or Single Thread View */}
        <div className="lg:col-span-9 space-y-4">
          {activeThreadId && activeThreadData ? (
            /* Active Thread Detail View */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveThreadId(null)}
                    className="text-xs text-orange-400 hover:underline font-mono"
                  >
                    ← Вернуться к списку тем
                  </button>
                  {user?.role === "admin" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          moderateThreadMutation.mutate({
                            id: activeThreadId,
                            isPinned: !activeThreadData.thread.isPinned,
                          })
                        }
                        className="text-xs border-zinc-700 h-7"
                      >
                        <Pin className="w-3 h-3 mr-1" />
                        {activeThreadData.thread.isPinned ? "Открепить" : "Закрепить"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          moderateThreadMutation.mutate({
                            id: activeThreadId,
                            isLocked: !activeThreadData.thread.isLocked,
                          })
                        }
                        className="text-xs border-zinc-700 h-7"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        {activeThreadData.thread.isLocked ? "Разблокировать" : "Закрыть"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteThreadMutation.mutate({ id: activeThreadId })}
                        className="text-xs h-7"
                      >
                        Удалить
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeThreadData.thread.isPinned && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono">
                      Закреплено
                    </span>
                  )}
                  {activeThreadData.thread.isLocked && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                      Закрыто для ответов
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-zinc-100">
                    {activeThreadData.thread.title}
                  </h2>
                </div>
              </div>

              {/* Thread Posts */}
              <div className="space-y-3">
                {activeThreadData.posts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex gap-4"
                  >
                    <div className="flex flex-col items-center gap-1 min-w-[70px]">
                      <img
                        src={`https://minotar.net/helm/${encodeURIComponent(
                          post.authorMinecraftNick || "MHF_Steve"
                        )}/64.png`}
                        alt=""
                        className="w-10 h-10 rounded-lg border border-orange-500/30"
                      />
                      <span className="text-[11px] font-semibold text-zinc-300 truncate max-w-[70px]">
                        {post.authorName}
                      </span>
                      {post.authorMinecraftNick && (
                        <span className="text-[9px] text-orange-400 font-mono">
                          {post.authorMinecraftNick}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>{new Date(post.createdAt).toLocaleString("ru-RU")}</span>
                        <span className="font-mono text-[10px]">#{idx + 1}</span>
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {isAuthenticated && !activeThreadData.thread.isLocked ? (
                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-200">Ответить в тему</h4>
                  <Textarea
                    rows={3}
                    placeholder="Напишите ваш ответ..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                  <Button
                    onClick={() =>
                      createReplyMutation.mutate({
                        threadId: activeThreadId,
                        content: replyContent,
                      })
                    }
                    disabled={createReplyMutation.isPending || !replyContent}
                    className="bg-orange-600 hover:bg-orange-500 text-zinc-950 font-bold"
                  >
                    {createReplyMutation.isPending ? "Отправка..." : "Отправить ответ"}
                  </Button>
                </div>
              ) : activeThreadData.thread.isLocked ? (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs text-blue-300 text-center font-mono">
                  Тема закрыта администратором. Новые сообщения отключены.
                </div>
              ) : null}
            </div>
          ) : (
            /* Threads List */
            <div className="space-y-3">
              {threads.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 font-mono text-sm bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                  В этой категории пока нет тем. Будьте первыми!
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {thread.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                        )}
                        {thread.isLocked && <Lock className="w-3.5 h-3.5 text-blue-400" />}
                        <h4 className="text-base font-bold text-zinc-100 group-hover:text-orange-400 transition-colors">
                          {thread.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span>Автор: {thread.authorName}</span>
                        {thread.authorMinecraftNick && (
                          <span className="text-orange-400">({thread.authorMinecraftNick})</span>
                        )}
                        <span>•</span>
                        <span>{new Date(thread.updatedAt).toLocaleDateString("ru-RU")}</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-zinc-400">
                      Ответов: <span>обсуждение →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
