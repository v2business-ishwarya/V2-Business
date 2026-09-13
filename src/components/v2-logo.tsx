import * as React from "react";

interface V2LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  isLightOnDark?: boolean;
}

export function V2LogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl" | number; className?: string }) {
  const pixelSize = typeof size === "number" ? size : size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 52 : 68;

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative shrink-0 rounded-2xl overflow-hidden shadow-md ring-1 ring-amber-500/30 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 dark:from-amber-950 dark:via-zinc-900 dark:to-amber-900/60 p-0.5 ${className}`}
    >
      <img
        src="/v2b-gold-logo.jpg"
        alt="V2B Gold Emblem"
        className="w-full h-full object-cover rounded-xl"
        onError={(e) => {
          // Fallback SVG if image not found
          const target = e.target as HTMLElement;
          target.style.display = "none";
        }}
      />
    </div>
  );
}

export function V2Logo({
  size = "md",
  showText = true,
  className = "",
  textColor,
  isLightOnDark,
  ...props
}: V2LogoProps) {
  const isWhite = isLightOnDark || textColor?.includes("text-white") || textColor?.includes("white");

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} {...props}>
      <V2LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <div
            className={`font-black tracking-tight flex items-baseline gap-1.5 ${
              size === "sm"
                ? "text-base"
                : size === "md"
                ? "text-lg"
                : size === "lg"
                ? "text-xl"
                : "text-2xl"
            }`}
          >
            <span
              style={{ color: isWhite ? "#FFFFFF" : undefined }}
              className={
                isWhite
                  ? "text-white font-black tracking-tight"
                  : "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-black tracking-tight drop-shadow-2xs"
              }
            >
              V2
            </span>
            <span
              style={{ color: isWhite ? "#FDE68A" : undefined }}
              className={
                isWhite
                  ? "font-extrabold text-amber-200"
                  : "bg-gradient-to-r from-yellow-600 via-amber-600 to-amber-700 bg-clip-text text-transparent font-black"
              }
            >
              Business
            </span>
          </div>
          <span
            style={{ color: isWhite ? "rgba(255, 255, 255, 0.9)" : undefined }}
            className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${
              isWhite ? "text-white/90" : "text-amber-700/80 dark:text-amber-300/80 font-bold"
            }`}
          >
            Marketplace
          </span>
        </div>
      )}
    </div>
  );
}

export default V2Logo;
