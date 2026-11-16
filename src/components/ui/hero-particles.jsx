'use client';

import { useSyncExternalStore } from 'react';

import { useTheme } from '@/components/theme-provider';
import DarkHeroParticles from '@/components/ui/dark-hero-particles';
import LightHeroParticles from '@/components/ui/light-hero-particles';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const noSubscribe = () => () => {};

// Each particle field runs its own animation loop, so only the one for the
// current theme is mounted (both used to run, one hidden by CSS). Nothing
// renders on the server, where the theme is not known yet, or for visitors
// who ask their system for reduced motion.
export default function HeroParticles() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true
  );

  if (!mounted || reducedMotion) return null;
  return resolvedTheme === 'dark' ? (
    <DarkHeroParticles />
  ) : (
    <LightHeroParticles />
  );
}
