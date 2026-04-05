'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function LenisProvider({ children }) {
  const pathname = usePathname();
  const lenisRef = useRef(null);

  // Skip smooth scroll on admin / studio routes — they use internal scroll containers.
  const isAdminRoute =
    pathname?.startsWith('/admin') || pathname?.startsWith('/studio');

  useEffect(() => {
    if (isAdminRoute) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdminRoute]);

  return children;
}
