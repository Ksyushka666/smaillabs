import React, { useRef, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";

interface Minecraft3DHeadProps {
  nick: string;
  sourceType?: "licensed" | "tlauncher" | "elyby";
  size?: number;
  interactive?: boolean;
  showProfileLink?: boolean;
  showTextureBadge?: boolean;
  className?: string;
  subTitle?: string;
}

/** A tactile Minecraft skin preview inspired by a live account profile card. */
export const Minecraft3DHead: React.FC<Minecraft3DHeadProps> = ({
  nick,
  sourceType = "licensed",
  size = 120,
  interactive = true,
  showProfileLink = true,
  showTextureBadge = true,
  className = "",
  subTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -12, y: 28 });
  const [isHovered, setIsHovered] = useState(false);

  const profileUrl =
    sourceType === "licensed"
      ? `https://namemc.com/profile/${encodeURIComponent(nick)}`
      : sourceType === "elyby"
        ? `https://ely.by/${encodeURIComponent(nick)}`
        : `https://tlauncher.org/ru/skin/${encodeURIComponent(nick)}`;
  const sourceLabel = sourceType === "licensed" ? "Лицензия (NameMC)" : sourceType === "elyby" ? "Ely.by (Живая текстура)" : "TLauncher (Пиратка)";
  const faceImg = `https://minotar.net/avatar/${encodeURIComponent(nick)}/128.png`;
  const helmImg = sourceType === "elyby"
    ? `https://skinsystem.ely.by/skins/${encodeURIComponent(nick)}.png`
    : `https://minotar.net/helm/${encodeURIComponent(nick)}/128.png`;
  const fallbackImg = "https://minotar.net/avatar/MHF_Steve/128.png";

  const handleTextureError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.currentTarget;
    if (image.src !== fallbackImg) image.src = fallbackImg;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({
      x: Math.max(-34, Math.min(34, -y * 0.28)),
      y: Math.max(-48, Math.min(48, x * 0.38)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: -12, y: 28 });
  };

  const half = size / 2;
  const faceClass = "absolute inset-0 overflow-hidden rounded-[0.55rem] border border-white/10 bg-[#302842]";
  const faceStyle = { imageRendering: "pixelated" as const };

  return (
    <div className={`flex min-w-0 max-w-full flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex max-w-full flex-col items-center overflow-visible rounded-[1.5rem] border border-indigo-300/20 bg-[radial-gradient(circle_at_50%_35%,rgba(74,55,130,0.32),transparent_58%),linear-gradient(145deg,#17142f,#0b0b18)] px-4 pb-4 pt-5 shadow-[0_20px_60px_rgba(15,10,40,0.38)]"
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-indigo-200/15"
          style={{ width: size * 1.48, height: size * 1.48, transform: "translate(-50%, -58%)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-violet-300/10"
          style={{ width: size * 1.7, height: size * 1.7, transform: "translate(-50%, -58%)" }}
        />
        <div
          className="relative z-10 cursor-grab select-none active:cursor-grabbing"
          style={{ width: size, height: size, maxWidth: "100%", perspective: 900 }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[0.55rem] border border-white/15 bg-[#49384a] shadow-[0_18px_30px_rgba(0,0,0,0.4)]" style={{ transform: `translateZ(${half}px)`, imageRendering: "pixelated" }}>
              <img src={helmImg} alt={`${nick} Minecraft skin`} className="h-full w-full object-cover" onError={handleTextureError} />
            </div>
            <div className={faceClass} style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)`, filter: "brightness(0.84)" }}>
              <img src={faceImg} alt="" className="h-full w-full object-cover transform scale-x-[-1]" onError={handleTextureError} />
            </div>
            <div className={faceClass} style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)`, filter: "brightness(0.7)" }}>
              <img src={faceImg} alt="" className="h-full w-full object-cover" onError={handleTextureError} />
            </div>
            <div className={faceClass} style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${half}px)`, filter: "brightness(1.16)" }}>
              <img src={helmImg} alt="" className="h-full w-full object-cover" onError={handleTextureError} />
            </div>
            <div className="absolute inset-0 rounded-[0.55rem] bg-[#100d1a]" style={{ transform: `rotateX(-90deg) translateZ(${half}px)`, filter: "brightness(0.45)" }} />
            <div className={faceClass} style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${half}px)`, filter: "brightness(0.6)" }}>
              <img src={faceImg} alt="" className="h-full w-full object-cover" onError={handleTextureError} />
            </div>
          </div>
        </div>

        {showTextureBadge && (
          <span className="relative z-10 mt-4 rounded-full border border-emerald-300/25 bg-emerald-950/30 px-4 py-1.5 text-xs font-medium text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.08)]">
            Живая текстура кожи
          </span>
        )}
      </div>

      {showProfileLink && (
        <div className="mt-3 max-w-full text-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Открыть профиль ${nick} (${sourceLabel})`}
            className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/40 px-2.5 py-1 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-900/50 hover:text-orange-300"
          >
            <span className="truncate">{nick}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          {subTitle && <p className="mt-1 flex items-center justify-center gap-1 text-xs text-zinc-400"><Sparkles className="h-3 w-3 text-amber-400" />{subTitle}</p>}
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-zinc-500 font-mono">{sourceLabel}</span>
        </div>
      )}
    </div>
  );
};
