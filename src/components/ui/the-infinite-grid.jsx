'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from 'framer-motion';

/**
 * InfiniteGridOverlay
 *
 * A purely decorative overlay: renders a faint scrolling grid with a
 * mouse-reactive radial-gradient reveal layer on top.
 *
 * Usage: place as an `absolute inset-0` child inside a `relative` container.
 * The z-index is left to the parent (pass className to control stacking).
 *
 * Mouse tracking uses a window-level pointermove listener so it works
 * even when interactive content sits above this overlay in the z-stack.
 */
export function InfiniteGridOverlay({ className = '' }) {
  const containerRef = useRef(null);

  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  // Listen on the window so the effect works regardless of z-index stacking
  useEffect(() => {
    const onMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      } else {
        mouseX.set(-9999);
        mouseY.set(-9999);
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouseX, mouseY]);

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.5) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.5) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      {/* Static faint base grid */}
      <div className="absolute inset-0 opacity-[0.07] text-white">
        <GridPattern patternId="hero-grid-base" offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>

      {/* Mouse-reactive bright reveal layer */}
      <motion.div
        className="absolute inset-0 opacity-50 text-white"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern patternId="hero-grid-reveal" offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>
    </div>
  );
}

function GridPattern({ patternId, offsetX, offsetY }) {
  return (
    <svg className="w-full h-full" aria-hidden="true">
      <defs>
        <motion.pattern
          id={patternId}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
