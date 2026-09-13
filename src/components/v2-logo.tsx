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
      ? 32
      : size === "md"
      ? 42
      : size === "lg"
      ? 54
      : 68;

  return (
    <img
      src="/v2b-gold-logo.png"
      alt="V2B Logo"
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
  showText = false,
  className = "",
  textColor,
  isLightOnDark,
  ...props
}: V2LogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`} {...props}>
      <V2LogoIcon size={size} />
    </div>
  );
}

export default V2Logo;

