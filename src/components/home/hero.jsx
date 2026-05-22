'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { InfiniteGridOverlay } from '@/components/ui/the-infinite-grid';
import SparklesText from '@/components/ui/sparkles-text';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeHero() {
  return (
    <section className="relative flex py-section-lg min-h-[auto] md:min-h-[60vh] items-center justify-center overflow-hidden bg-black text-white px-4">
      {/* Background Image */}
      <div className="hero-bg-image absolute inset-0 z-0 opacity-30" />

      {/* Vignette Overlay to darken edges more firmly */}
      <div className="hero-vignette absolute inset-0 z-[5] pointer-events-none" />

      {/* Hero photo color overlay */}
      <div className="hero-color-overlay absolute inset-0 z-10 opacity-75" />

      {/* Active grid layer — sits above gradient overlay, below content */}
      <InfiniteGridOverlay className="z-[15]" />

      <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center mt-4 md:mt-8">
        <motion.div
          className="mb-6 flex flex-col items-center justify-center gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 md:mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span>Trust and Safety India Festival</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>An Initiative by Centre For Social Research</span>
            <span
              className="hidden h-1 w-1 rounded-full md:block"
              style={{ backgroundColor: '#fff' }}
            />
            <span>Trust &amp; Safety Forum</span>
          </div>
        </motion.div>

        {/* Logo and Date Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.1}
        >
          {/* Left Side: Logo equivalent */}
          <div className="flex-1 flex justify-center md:justify-end text-center md:text-right">
            <h1
              className="text-[3.5rem] md:text-[5.5rem] font-bold leading-[0.9] text-white tracking-tighter w-full md:w-auto text-center md:text-right flex flex-col items-center md:items-end justify-end"
              aria-label="Trust and Safety India Festival TASI 2026"
            >
              <span className="leading-[0.8] mb-2">TASI</span>
              <SparklesText className="text-[2.8rem] md:text-[4.2rem] font-black leading-[0.8] text-rc-secondary dark:text-white">
                2026
              </SparklesText>
            </h1>
          </div>

          {/* Vertical Separator */}
          <div
            className="hidden md:block w-[2px] h-24"
            style={{ backgroundColor: '#fff' }}
          ></div>
          <div
            className="md:hidden h-[2px] w-24 my-2"
            style={{ backgroundColor: '#fff' }}
          ></div>

          {/* Right Side: Location and Info */}
          <div className="flex-1 flex justify-center md:justify-start text-center md:text-left">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <SparklesText className="text-[2.5rem] md:text-[4rem] font-black text-rc-secondary dark:text-white leading-none mb-3 tracking-tight drop-shadow-sm">
                Delhi
              </SparklesText>
              <p className="text-sm md:text-base font-bold tracking-[0.15em] text-white mb-2">
                IN PERSON & ONLINE
              </p>
              <p className="text-sm md:text-base font-bold tracking-[0.15em] text-white">
                OCT 14 - 15, 2026
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-7 md:mt-8 flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.3}
        >
          <p className="mb-3 text-base font-semibold italic text-white/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)] md:text-lg">
            People First. Safety Always.
          </p>
          <p className="mb-8 max-w-4xl text-sm leading-relaxed text-white/95 [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] md:text-lg">
            Trust and Safety India Festival brings leaders across AI, digital
            rights, regulation, tech policy, and platform safety together to
            collaborate on emerging trends and practical solutions for digital
            spaces.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sponsor"
              className="inline-flex rounded-full border border-white/60 px-[28px] py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-white transition-all hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Become a Sponsor
            </Link>
            <a
              href="https://drive.google.com/file/d/1oG8biMtiPTBxKnABevMPAOsqx2paykwS/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-rc-accent px-[28px] py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-rc-secondary dark:border-white/70 dark:text-white transition-all hover:bg-rc-secondary hover:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Download Brochure
            </a>
            <a
              href="https://drive.google.com/file/d/1S9dHlHQg8pm0-HjsjkXK0dwOSUCYqhxn/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-rc-accent px-[28px] py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-rc-secondary dark:border-white/70 dark:text-white transition-all hover:bg-rc-secondary hover:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Read TASI 2025 Report
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
