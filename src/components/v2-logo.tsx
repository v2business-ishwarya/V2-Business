import * as React from "react";

interface V2LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  isLightOnDark?: boolean;
}

export function V2LogoIcon({ size = "md", className = "", ...props }: V2LogoProps) {
  const pixelSize = typeof size === "number" ? size : size === "sm" ? 28 : size === "md" ? 36 : size === "lg" ? 48 : 64;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="v2BgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>

        {/* Glow / Accent Gradient */}
        <linearGradient id="v2LetterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>

        {/* Shadow filter */}
        <filter id="v2Shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#064E3B" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Rounded Hexagonal / Squircle Emblem Container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#v2BgGradient)"
        filter="url(#v2Shadow)"
      />

      {/* Inner Subtle Border / Highlight */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Stylized "V" */}
      <path
        d="M11 15L19 32.5C19.5 33.5 20.9 33.5 21.4 32.5L29 15"
        stroke="url(#v2LetterGradient)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stylized "2" with sleek curve and baseline bar */}
      <path
        d="M26 18C26 15 28.5 13 32 13C35 13 37.5 15 37.5 18C37.5 22 27 27 26 33H38.5"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tiny Sparkle Accent Top Right */}
      <circle cx="39" cy="9" r="2" fill="#FDE047" />
    </svg>
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
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <V2LogoIcon size={size} {...props} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight ${
              size === "sm"
                ? "text-base"
                : size === "md"
                ? "text-lg"
                : size === "lg"
                ? "text-xl"
                : "text-2xl"
            } ${textColor ?? (isWhite ? "text-white" : "text-foreground")}`}
          >
            V2{" "}
            <span className={isWhite ? "text-emerald-200 font-bold" : "text-primary font-bold"}>
              Business
            </span>
          </span>
          <span
            className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${
              isWhite ? "text-white/80" : "text-muted-foreground"
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
