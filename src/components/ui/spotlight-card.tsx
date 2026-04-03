"use client";

import React, {
  useEffect,
  useRef,
  useState,
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
  blue: { base: 220, spread: 200, ring: "rgba(59, 130, 246, 0.82)" },
  purple: { base: 280, spread: 300, ring: "rgba(168, 85, 247, 0.82)" },
  green: { base: 120, spread: 200, ring: "rgba(34, 197, 94, 0.82)" },
  red: { base: 0, spread: 200, ring: "rgba(239, 68, 68, 0.82)" },
  orange: { base: 30, spread: 200, ring: "rgba(251, 146, 60, 0.88)" },
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
  ring,
  width,
  height,
  isHovering,
}: {
  base: number;
  spread: number;
  ring: string;
  width?: string | number;
  height?: string | number;
  isHovering: boolean;
}): GlowStyle {
  const baseStyles: GlowStyle = {
    "--base": String(base),
    "--spread": String(spread),
    "--radius": "14",
    "--border": "3",
    "--backdrop": "hsl(0 0% 60% / 0.12)",
    "--backup-border": "var(--backdrop)",
    "--size": "200",
    "--outer": "1",
    "--bg-spot-opacity": "0.26",
    "--border-spot-opacity": "0.95",
    "--border-light-opacity": "0.7",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundColor: "var(--backdrop, transparent)",
    border: "var(--border-size) solid var(--backup-border)",
    boxShadow: isHovering
      ? `0 0 0 1px ${ring}, 0 0 30px ${ring}, 0 0 72px ${ring}, 0 1rem 2rem -1rem rgba(0,0,0,0.55)`
      : "0 1rem 2rem -1rem rgba(0,0,0,0.85)",
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

const beforeAfterStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
      transparent 100%
    );
    filter: brightness(2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)),
      transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }

  [data-glow-overlay] {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background-image: radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) 100% 72% / var(--bg-spot-opacity, 0.1)),
      transparent 72%
    );
    mix-blend-mode: screen;
    opacity: 0;
    transition: opacity 180ms ease;
  }

  [data-glow][data-hovering="true"] [data-glow-overlay] {
    opacity: 1;
  }
`;

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { base, spread, ring } = glowColorMap[glowColor];

  useEffect(() => {
    const syncPointer = (event: PointerEvent) => {
      if (!cardRef.current) return;

      const bounds = cardRef.current.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const xp = bounds.width > 0 ? x / bounds.width : 0;
      const yp = bounds.height > 0 ? y / bounds.height : 0;

      cardRef.current.style.setProperty("--x", x.toFixed(2));
      cardRef.current.style.setProperty("--xp", xp.toFixed(2));
      cardRef.current.style.setProperty("--y", y.toFixed(2));
      cardRef.current.style.setProperty("--yp", yp.toFixed(2));
    };

    const node = cardRef.current;
    node?.addEventListener("pointermove", syncPointer);
    return () => node?.removeEventListener("pointermove", syncPointer);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        data-hovering={isHovering ? "true" : "false"}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
        style={buildInlineStyles({ base, spread, ring, width, height, isHovering })}
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
        <div data-glow />
        <div data-glow-overlay />
        <div className="relative z-10 h-full w-full overflow-hidden rounded-[inherit]">
          {children}
        </div>
      </div>
    </>
  );
};

export { GlowCard };
