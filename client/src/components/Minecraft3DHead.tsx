import React, { useRef, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";

interface Minecraft3DHeadProps {
  nick: string;
  sourceType?: "licensed" | "tlauncher";
  size?: number;
  interactive?: boolean;
  showProfileLink?: boolean;
  className?: string;
  subTitle?: string;
}

export const Minecraft3DHead: React.FC<Minecraft3DHeadProps> = ({
  nick,
  sourceType = "licensed",
  size = 120,
  interactive = true,
  showProfileLink = true,
  className = "",
  subTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -15, y: 35 });
  const [isHovered, setIsHovered] = useState(false);

  const profileUrl =
    sourceType === "licensed"
      ? `https://namemc.com/profile/${encodeURIComponent(nick)}`
      : `https://tlauncher.org/ru/skin/${encodeURIComponent(nick)}`;
  const sourceLabel = sourceType === "licensed" ? "Лицензия (NameMC)" : "TLauncher (Пиратка)";
  const faceImg = `https://minotar.net/avatar/${encodeURIComponent(nick)}/128.png`;
  const helmImg = `https://minotar.net/helm/${encodeURIComponent(nick)}/128.png`;
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
      x: Math.max(-45, Math.min(45, -y * 0.4)),
      y: Math.max(-60, Math.min(60, x * 0.5)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: -15, y: 35 });
  };

  const half = size / 2;
  const faceClass = "absolute inset-0 rounded-sm border border-orange-500/20 overflow-hidden bg-zinc-800";
  const faceStyle = { imageRendering: "pixelated" as const };

  return (
    <div className={`flex min-w-0 max-w-full flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative max-w-full cursor-grab select-none active:cursor-grabbing transition-transform duration-150"
        style={{ width: size, height: size, maxWidth: "100%", perspective: 800, touchAction: "pan-y" }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isHovered ? "none" : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          <div className="absolute inset-0 rounded-sm border border-orange-500/30 overflow-hidden bg-zinc-900 shadow-lg" style={{ transform: `translateZ(${half}px)`, imageRendering: "pixelated" }}>
            <img src={helmImg} alt={`${nick} face`} className="h-full w-full object-cover" onError={handleTextureError} />
          </div>
          <div className={faceClass} style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)`, filter: "brightness(0.85)" }}>
            <img src={faceImg} alt="" className="h-full w-full object-cover transform scale-x-[-1]" onError={handleTextureError} />
          </div>
          <div className={faceClass} style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)`, filter: "brightness(0.75)" }}>
            <img src={faceImg} alt="" className="h-full w-full object-cover" onError={handleTextureError} />
          </div>
          <div className={faceClass} style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${half}px)`, filter: "brightness(1.15)" }}>
            <img src={helmImg} alt="" className="h-full w-full object-cover" onError={handleTextureError} />
          </div>
          <div className="absolute inset-0 rounded-sm bg-zinc-950" style={{ transform: `rotateX(-90deg) translateZ(${half}px)`, filter: "brightness(0.5)" }} />
          <div className="absolute inset-0 rounded-sm border border-orange-500/20 overflow-hidden bg-zinc-900" style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${half}px)`, filter: "brightness(0.65)" }}>
            <img src={faceImg} alt="" className="h-full w-full object-cover" onError={handleTextureError} />
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full bg-orange-500/20 blur-sm transition-all duration-200" style={{ transform: `scale(${isHovered ? 1.15 : 1})`, opacity: isHovered ? 0.7 : 0.4 }} />
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
