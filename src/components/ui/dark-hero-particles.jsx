'use client';

import { SparklesCore } from '@/components/ui/sparkles-core';

export default function DarkHeroParticles() {
  return (
    <>
      <SparklesCore
        className="pointer-events-none absolute inset-0 hidden dark:block"
        background="transparent"
        minSize={0.8}
        maxSize={2.3}
        speed={2}
        particleColor="#e2e8f0"
        particleDensity={95}
      />
    </>
  );
}
