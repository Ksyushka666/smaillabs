import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Minecraft3DHead } from "@/components/Minecraft3DHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, UserCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Apply() {
  const [form, setForm] = useState({
    nickname: "",
    minecraftNick: "",
    skinSourceType: "licensed" as "licensed" | "tlauncher",
    age: 16,
    roleDesired: "Разработчик плагинов / Модмейкер",
    contacts: "",
    portfolioOrExperience: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const applyMutation = trpc.applications.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Заявка успешно отправлена лидеру SmailLabs!");
    },
    onError: (err) => {
      toast.error(err.message || "Ошибка отправки заявки");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nickname || !form.minecraftNick || !form.contacts || !form.portfolioOrExperience) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }
    applyMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-950/40 text-orange-400 text-xs font-mono uppercase">
          <UserCheck className="w-3.5 h-3.5" />
          Набор в команду
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-100">Вступить в SmailLabs</h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Мы ищем толковых Java/Kotlin разработчиков, создателей ресурспаков, бета-тестеров, билдеров и контент-мейкеров. Заполните анкету ниже:
        </p>
      </div>

      {submitted ? (
        <div className="p-10 rounded-3xl bg-zinc-900/80 border border-orange-500/40 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-100">Заявка принята на рассмотрение!</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Руководство SmailLabs проверит вашу анкету и свяжется по указанным контактам. Спасибо за интерес к нашим проектам!
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setForm({
                nickname: "",
                minecraftNick: "",
                skinSourceType: "licensed",
                age: 16,
                roleDesired: "Разработчик плагинов / Модмейкер",
                contacts: "",
                portfolioOrExperience: "",
              });
            }}
            variant="outline"
            className="border-zinc-700 text-zinc-300"
          >
            Отправить ещё одну заявку
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-8 p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5"
          >
            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1 block">
                Ваше имя или никнейм *
              </label>
              <Input
                placeholder="Как к вам обращаться"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 mb-1 block">
                  Ник в Minecraft *
                </label>
                <Input
                  placeholder="YTSmailDog"
                  value={form.minecraftNick}
                  onChange={(e) => setForm({ ...form, minecraftNick: e.target.value })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 mb-1 block">
                  Тип скина / аккаунта
                </label>
                <select
                  value={form.skinSourceType}
                  onChange={(e) =>
                    setForm({ ...form, skinSourceType: e.target.value as "licensed" | "tlauncher" })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200"
                >
                  <option value="licensed">Лицензия (Mojang / NameMC)</option>
                  <option value="tlauncher">Пиратка (TLauncher)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 mb-1 block">Желаемая роль</label>
                <select
                  value={form.roleDesired}
                  onChange={(e) => setForm({ ...form, roleDesired: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200"
                >
                  <option value="Разработчик плагинов / Модмейкер">Разработчик плагинов / Модмейкер</option>
                  <option value="Бета-тестер">Бета-тестер</option>
                  <option value="Билдер / Левел-дизайнер">Билдер / Левел-дизайнер</option>
                  <option value="Контент-мейкер / YouTube">Контент-мейкер / YouTube</option>
                  <option value="Модератор комьюнити">Модератор комьюнити</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 mb-1 block">Возраст</label>
                <Input
                  type="number"
                  min={10}
                  max={99}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1 block">
                Контакты для связи (Discord / Telegram) *
              </label>
              <Input
                placeholder="discord_tag или @username"
                value={form.contacts}
                onChange={(e) => setForm({ ...form, contacts: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1 block">
                Опыт, навыки или ссылки на работы *
              </label>
              <Textarea
                rows={4}
                placeholder="Расскажите о себе, какие проекты делали, с какими версиями Minecraft работали..."
                value={form.portfolioOrExperience}
                onChange={(e) => setForm({ ...form, portfolioOrExperience: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200"
              />
            </div>

            <Button
              type="submit"
              disabled={applyMutation.isPending}
              className="w-full bg-orange-600 hover:bg-orange-500 text-zinc-950 font-bold h-12 text-base shadow-lg shadow-orange-600/20"
            >
              {applyMutation.isPending ? "Отправка..." : "Отправить заявку в SmailLabs"}
            </Button>
          </form>

          {/* Real-time 3D Skin preview */}
          <div className="md:col-span-4 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
            <span className="text-xs font-mono uppercase text-orange-400 tracking-wider">
              Предпросмотр 3D-Головы
            </span>
            <div className="py-4 flex justify-center">
              <Minecraft3DHead
                nick={form.minecraftNick || "Steve"}
                sourceType={form.skinSourceType}
                size={110}
                interactive={true}
              />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Так ваша голова будет отображаться в карточке команды после одобрения заявки.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
