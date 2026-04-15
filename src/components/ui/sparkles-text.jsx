'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SPARKLES = [
  {
    className:
      '-left-[0.2em] top-[0.12em] text-[0.22em] text-white/85 md:-left-[0.28em]',
    duration: 2.8,
    delay: 0.15,
    driftY: -5,
  },
  {
    className:
      'left-[18%] -top-[0.22em] text-[0.18em] text-amber-200/90 md:-top-[0.28em]',
    duration: 3.1,
    delay: 0.45,
    driftY: -4,
  },
  {
    className:
      'right-[12%] top-[0.04em] text-[0.2em] text-rose-100/80 md:right-[8%]',
    duration: 2.9,
    delay: 0.85,
    driftY: -6,
  },
  {
    className:
      'right-[-0.22em] bottom-[0.18em] text-[0.24em] text-white/75 md:right-[-0.3em]',
    duration: 3.3,
    delay: 1.15,
    driftY: -5,
  },
];

export default function SparklesText({ children, className }) {
  return (
    <span className={cn('relative inline-flex items-center', className)}>
      <span className="relative z-10 inline-block [text-shadow:0_4px_18px_rgba(255,255,255,0.14)]">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      >
        {SPARKLES.map((sparkle, index) => (
          <motion.span
            key={`${children}-${index}`}
            className={cn(
              'absolute inline-flex select-none items-center justify-center font-black leading-none',
              sparkle.className
            )}
            initial={{ opacity: 0.2, scale: 0.75, y: 0 }}
            animate={{
              opacity: [0.15, 0.9, 0.18],
              scale: [0.75, 1.12, 0.82],
              y: [0, sparkle.driftY, 0],
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            ✦
          </motion.span>
        ))}
      </span>
    </span>
  );
}
