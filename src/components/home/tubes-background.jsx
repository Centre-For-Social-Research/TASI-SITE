"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function randomColors(count) {
  return new Array(count)
    .fill(0)
    .map(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`);
}

export default function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
}) {
  const canvasRef = useRef(null);
  const paletteRef = useRef(["#f967fb", "#53bc28", "#6958d5", "#60aed5"]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    let raf = 0;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < 3; i++) {
        const color = paletteRef.current[i % paletteRef.current.length];
        const x = width * (0.2 + i * 0.3) + Math.sin(t + i) * 40;
        const y = height * (0.45 + Math.cos(t * 0.6 + i) * 0.2);
        const radius = Math.max(width, height) * 0.35;
        const g = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        g.addColorStop(0, `${color}55`);
        g.addColorStop(1, "#00000000");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      t += 0.01;
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    setIsLoaded(true);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction) {
      return;
    }
    paletteRef.current = randomColors(4);
  };

  return (
    <div
      className={cn("relative h-full w-full min-h-[400px] overflow-hidden", className)}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      {!isLoaded ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.35),transparent_45%),linear-gradient(180deg,#0b1022_0%,#070910_100%)]" />
      ) : null}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
