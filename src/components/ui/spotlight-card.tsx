"use client";

import React, {
  type CSSProperties,
  type ReactNode,
} from "react";

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
} as const;

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
} as const;

type GlowStyle = CSSProperties & Record<`--${string}`, string>;

function getSizeClasses(size: GlowCardProps["size"], customSize: boolean) {
  if (customSize) return "";
  return sizeMap[size || "md"];
}

function buildInlineStyles({
  base,
  spread,
  width,
  height,
}: {
  base: number;
  spread: number;
  width?: string | number;
  height?: string | number;
}): GlowStyle {
  const baseStyles: GlowStyle = {
    "--base": String(base),
    "--spread": String(spread),
    "--radius": "14",
    "--border": "3",
    "--backdrop": "hsl(0 0% 60% / 0.12)",
    "--backup-border": "var(--backdrop)",
    "--border-size": "calc(var(--border, 2) * 1px)",
    backgroundColor: "var(--backdrop, transparent)",
    border: "var(--border-size) solid var(--backup-border)",
    boxShadow: "0 1rem 2rem -1rem rgba(0,0,0,0.85)",
    position: "relative",
    touchAction: "none",
  };

  if (width !== undefined) {
    baseStyles.width = typeof width === "number" ? `${width}px` : width;
  }

  if (height !== undefined) {
    baseStyles.height = typeof height === "number" ? `${height}px` : height;
  }

  return baseStyles;
}
const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const { base, spread } = glowColorMap[glowColor];

  return (
    <div
      data-glow
      style={buildInlineStyles({ base, spread, width, height })}
      className={`
        ${getSizeClasses(size, customSize)}
        ${!customSize ? "aspect-[3/4]" : ""}
        relative
        overflow-visible
        rounded-2xl
        p-4
        transition-[box-shadow,transform] duration-200
        backdrop-blur-[5px]
        ${className}
      `}
    >
      <div className="relative z-10 h-full w-full overflow-hidden rounded-[inherit]">
        {children}
      </div>
    </div>
  );
};

export { GlowCard };
