'use client';

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

/**
 * InfiniteGridOverlay
 *
 * A purely decorative overlay: renders a faint drifting grid with a
 * mouse-reactive radial-gradient reveal layer on top.
 *
 * Usage: place as an `absolute inset-0` child inside a `relative` container.
 * The z-index is left to the parent (pass className to control stacking).
 *
 * Mouse tracking uses a window-level pointermove listener so it works
 * even when interactive content sits above this overlay in the z-stack.
 *
 * The drift is a CSS transform on an oversized grid (see `.hero-grid-drift`
 * in globals.css), so the GPU moves it without repainting. The earlier
 * version shifted an SVG pattern every frame, which repainted the whole
 * page 60 times a second and made scrolling stutter.
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
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouseX, mouseY]);

  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Faint base grid */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.07] text-white">
        <GridPattern />
      </div>

      {/* Mouse-reactive bright reveal layer */}
      <motion.div
        className="absolute inset-0 overflow-hidden opacity-50 text-white"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern />
      </motion.div>
    </div>
  );
}

// 40px cells with a 1px line on the top and left edge of each cell. The
// layer is one cell larger than its parent on every side, so sliding it one
// cell and snapping back loops without a visible seam.
function GridPattern() {
  return (
    <div
      aria-hidden="true"
      className="hero-grid-drift absolute -inset-10"
      style={{
        backgroundImage:
          'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  );
}
