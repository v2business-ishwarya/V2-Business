import * as React from "react";

interface V2LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  isLightOnDark?: boolean;
}

export function V2LogoIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}) {
  const height =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 30
      : size === "md"
      ? 38
      : size === "lg"
      ? 48
      : 60;

  return (
    <img
      src="/v2b-gold-logo.png"
      alt="V2B Gold Logo"
      style={{ height: `${height}px`, width: "auto" }}
      className={`shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(217,119,6,0.25)] hover:scale-105 transition-transform duration-200 ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/logo.png";
      }}
    />
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
          <span
            style={{ color: isWhite ? "#FFFFFF" : undefined }}
            className={`font-black tracking-tight ${
              size === "sm"
                ? "text-xs font-bold"
                : size === "md"
                ? "text-sm font-extrabold"
                : size === "lg"
                ? "text-base font-black"
                : "text-lg font-black"
            } ${
              isWhite
                ? "text-white"
                : "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent"
            }`}
          >
            BUSINESS
          </span>
          <span
            style={{ color: isWhite ? "rgba(253, 230, 138, 0.9)" : undefined }}
            className={`text-[9px] uppercase font-bold tracking-widest mt-0.5 ${
              isWhite ? "text-amber-200" : "text-amber-700/90 dark:text-amber-400"
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
