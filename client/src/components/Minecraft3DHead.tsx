import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";

interface Minecraft3DHeadProps {
  nick: string;
  sourceType?: "licensed" | "tlauncher";
  size?: number; // size in pixels
  interactive?: boolean;
  showProfileLink?: boolean;
  className?: string;
  subTitle?: string;
}

/**
 * 3D isometric/interactive Minecraft head cube renderer.
 * Renders the 6 faces of the head cube from texture coordinates with an outer hat layer,
 * mouse rotation, and link to NameMC (licensed) or TLauncher skin profile.
 */
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

  // Resolution of external profile links
  const profileUrl =
    sourceType === "licensed"
      ? `https://namemc.com/profile/${encodeURIComponent(nick)}`
      : `https://tlauncher.org/ru/skin/${encodeURIComponent(nick)}`;

  const sourceLabel = sourceType === "licensed" ? "Лицензия (NameMC)" : "TLauncher (Пиратка)";

  // We use Minotar helm avatar as face texture, or full 3D head rendered via canvas/isometric cube
  const faceImg = `https://minotar.net/avatar/${encodeURIComponent(nick)}/128.png`;
  const helmImg = `https://minotar.net/helm/${encodeURIComponent(nick)}/128.png`;

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

  // Cube half-size in px for CSS 3D transforms
  const half = size / 2;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-grab active:cursor-grabbing transition-transform duration-150"
        style={{
          width: size,
          height: size,
          perspective: 800,
        }}
      >
        {/* 3D Rotating Head Cube */}
        <div
          className="w-full h-full relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isHovered ? "none" : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          {/* Front Face (Face with Helm) */}
          <div
            className="absolute inset-0 rounded-sm border border-emerald-500/30 overflow-hidden shadow-lg bg-zinc-900"
            style={{
              transform: `translateZ(${half}px)`,
              imageRendering: "pixelated",
            }}
          >
            <img
              src={helmImg}
              alt={`${nick} face`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to Steve head if skin not loaded
                (e.target as HTMLImageElement).src = `https://minotar.net/avatar/MHF_Steve/128.png`;
              }}
            />
          </div>

          {/* Right Face */}
          <div
            className="absolute inset-0 rounded-sm border border-emerald-500/20 overflow-hidden bg-zinc-800"
            style={{
              transform: `rotateY(90deg) translateZ(${half}px)`,
              filter: "brightness(0.85)",
              imageRendering: "pixelated",
            }}
          >
            <img
              src={faceImg}
              alt=""
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>

          {/* Left Face */}
          <div
            className="absolute inset-0 rounded-sm border border-emerald-500/20 overflow-hidden bg-zinc-800"
            style={{
              transform: `rotateY(-90deg) translateZ(${half}px)`,
              filter: "brightness(0.75)",
              imageRendering: "pixelated",
            }}
          >
            <img src={faceImg} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Top Face */}
          <div
            className="absolute inset-0 rounded-sm border border-emerald-500/20 overflow-hidden bg-zinc-700"
            style={{
              transform: `rotateX(90deg) translateZ(${half}px)`,
              filter: "brightness(1.15)",
              imageRendering: "pixelated",
            }}
          >
            <img src={helmImg} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Bottom Face */}
          <div
            className="absolute inset-0 rounded-sm bg-zinc-950"
            style={{
              transform: `rotateX(-90deg) translateZ(${half}px)`,
              filter: "brightness(0.5)",
            }}
          />

          {/* Back Face */}
          <div
            className="absolute inset-0 rounded-sm border border-emerald-500/20 overflow-hidden bg-zinc-900"
            style={{
              transform: `rotateY(180deg) translateZ(${half}px)`,
              filter: "brightness(0.65)",
              imageRendering: "pixelated",
            }}
          >
            <img src={faceImg} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Dynamic drop shadow under 3D Head */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full bg-emerald-500/20 blur-sm pointer-events-none transition-all duration-200"
          style={{
            transform: `scale(${isHovered ? 1.15 : 1})`,
            opacity: isHovered ? 0.7 : 0.4,
          }}
        />
      </div>

      {/* Nick and link info */}
      {showProfileLink && (
        <div className="mt-3 text-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Открыть профиль ${nick} (${sourceLabel})`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/40 hover:bg-emerald-900/50 px-2.5 py-1 rounded-full border border-emerald-500/30 group"
          >
            <span>{nick}</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          {subTitle && (
            <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {subTitle}
            </p>
          )}
          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5 font-mono">
            {sourceLabel}
          </span>
        </div>
      )}
    </div>
  );
};
