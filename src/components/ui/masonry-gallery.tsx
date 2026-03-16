"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

export interface MasonryItem {
  id: string;
  img: string;
  url?: string;
  height: number;
  title?: string;
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MasonryGalleryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  className?: string;
  itemClassName?: string;
  onItemClick?: (item: MasonryItem, index: number) => void;
}

const mediaQueries = ["(min-width: 1500px)", "(min-width: 1000px)", "(min-width: 600px)", "(min-width: 400px)"];
const mediaValues = [4, 4, 3, 2];

const useMedia = (queries: readonly string[], values: readonly number[], defaultValue: number): number => {
  const getValue = () => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const match = queries.findIndex((query) => window.matchMedia(query).matches);
    return values[match] ?? defaultValue;
  };

  const [value, setValue] = useState<number>(getValue);

  useEffect(() => {
    const listeners = queries.map((query) => window.matchMedia(query));
    const handler = () => setValue(getValue());

    listeners.forEach((listener) => listener.addEventListener("change", handler));
    return () => listeners.forEach((listener) => listener.removeEventListener("change", handler));
  }, [queries, values]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.src = src;
          image.onload = image.onerror = () => resolve();
        })
    )
  );
};

export default function MasonryGallery({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  className,
  itemClassName,
  onItemClick,
}: MasonryGalleryProps) {
  const columns = useMedia(mediaQueries, mediaValues, 1);
  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    setImagesReady(false);
    preloadImages(items.map((item) => item.img)).then(() => setImagesReady(true));
  }, [items]);

  const { grid, containerHeight } = useMemo(() => {
    if (!width) {
      return { grid: [] as GridItem[], containerHeight: 0 };
    }

    const gap = 24;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;
    const columnHeights = new Array(columns).fill(0);

    const computedGrid = items.map((item) => {
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      const x = column * (columnWidth + gap);
      const h = (item.height / 400) * columnWidth;
      const y = columnHeights[column];
      columnHeights[column] += h + gap;

      return { ...item, x, y, w: columnWidth, h };
    });

    return {
      grid: computedGrid,
      containerHeight: Math.max(...columnHeights, 400),
    };
  }, [columns, items, width]);

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      return { x: item.x, y: item.y };
    }

    let direction = animateFrom;
    if (animateFrom === "random") {
      const randomDirections: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];
      direction = randomDirections[Math.floor(Math.random() * randomDirections.length)];
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -220 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 220 };
      case "left":
        return { x: -220, y: item.y };
      case "right":
        return { x: window.innerWidth + 220, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) {
      return;
    }

    grid.forEach((item, index) => {
      const element = document.querySelector<HTMLElement>(`[data-key=\"${item.id}\"]`);
      if (!element) {
        return;
      }

      const animationTarget = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          element,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus ? { filter: "blur(20px)" } : {}),
          },
          {
            opacity: 1,
            ...animationTarget,
            ...(blurToFocus ? { filter: "blur(0px)" } : {}),
            duration: 1.2,
            ease: "power3.out",
            delay: index * stagger,
          }
        );
      } else {
        gsap.to(element, {
          ...animationTarget,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [animateFrom, blurToFocus, duration, ease, grid, imagesReady, stagger]);

  const onMouseEnter = (element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(element, {
        scale: hoverScale,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector<HTMLElement>(".masonry-color-overlay");
      if (overlay) {
        gsap.to(overlay, { opacity: 0.3, duration: 0.4 });
      }
    }
  };

  const onMouseLeave = (element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(element, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector<HTMLElement>(".masonry-color-overlay");
      if (overlay) {
        gsap.to(overlay, { opacity: 0, duration: 0.4 });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: containerHeight, minHeight: "400px" }}
    >
      {grid.map((item, index) => (
        <div
          key={item.id}
          data-key={item.id}
          className={cn(
            "absolute cursor-pointer overflow-hidden rounded-xl transition-shadow hover:shadow-2xl",
            itemClassName
          )}
          style={{
            willChange: "transform, width, height, opacity, filter",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
          }}
          onClick={() => {
            if (onItemClick) {
              onItemClick(item, index);
              return;
            }

            if (item.url) {
              window.open(item.url, "_blank", "noopener");
            }
          }}
          onMouseEnter={(event) => onMouseEnter(event.currentTarget)}
          onMouseLeave={(event) => onMouseLeave(event.currentTarget)}
        >
          <img src={item.img} alt={item.title || "Gallery image"} className="h-full w-full object-cover" loading="lazy" />

          {colorShiftOnHover ? (
            <div className="masonry-color-overlay pointer-events-none absolute inset-0 bg-gradient-to-tr from-orange-600/40 to-amber-400/40 opacity-0" />
          ) : null}

          {item.title ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white">{item.title}</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
