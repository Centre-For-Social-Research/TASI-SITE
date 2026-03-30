'use client';

import { SparklesCore } from '@/components/ui/sparkles-core';

export default function DarkHeroParticles() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden dark:block [background:radial-gradient(circle_at_20%_18%,rgba(6,182,212,0.2),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(232,121,249,0.16),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.14),transparent_42%)]" />
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
