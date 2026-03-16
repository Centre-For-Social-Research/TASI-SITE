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
  const tubesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cleanup;
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const initTubes = async () => {
      try {
        const importRuntime = new Function("u", "return import(u)");
        const module = await importRuntime(
          "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
        );

        if (!mounted) {
          return;
        }

        const TubesCursor = module.default;
        const app = TubesCursor(canvas, {
          tubes: {
            colors: ["#f967fb", "#53bc28", "#6958d5"],
            lights: {
              intensity: 200,
              colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
            },
          },
        });

        tubesRef.current = app;
        setIsLoaded(true);

        const handleResize = () => {
          if (app?.resize) {
            app.resize();
          }
        };

        window.addEventListener("resize", handleResize);
        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          if (app?.destroy) {
            app.destroy();
          }
          tubesRef.current = null;
        };
      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) {
      return;
    }

    const colors = randomColors(3);
    const lightsColors = randomColors(4);

    if (tubesRef.current.tubes?.setColors) {
      tubesRef.current.tubes.setColors(colors);
    }
    if (tubesRef.current.tubes?.setLightsColors) {
      tubesRef.current.tubes.setLightsColors(lightsColors);
    }
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
