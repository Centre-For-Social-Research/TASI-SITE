'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, MonitorPlay, Users, Mic2, Globe } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const INFO_CHIPS = [
  { icon: Calendar, label: 'OCT 13 – 14, 2026' },
  { icon: MapPin, label: 'India Habitat Centre, New Delhi' },
  { icon: MonitorPlay, label: 'In Person & Online' },
];

const STATS = [
  { icon: Users, value: '800+', label: 'Delegates' },
  { icon: Mic2, value: '60+', label: 'Speakers' },
  { icon: Globe, value: '20+', label: 'Countries' },
];

export default function HomeHero() {
  return (
    <section className="relative flex flex-col min-h-[92vh] items-center justify-center overflow-hidden bg-black text-white px-4 py-16 md:py-20">
      {/* Background Image */}
      <div className="hero-bg-image absolute inset-0 z-0 opacity-30" />

      {/* Vignette */}
      <div className="hero-vignette absolute inset-0 z-[5] pointer-events-none" />

      {/* Color overlay */}
      <div className="hero-color-overlay absolute inset-0 z-10 opacity-75" />

      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center">

        {/* Organiser badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[10px] border border-white/20 bg-white/[0.08] backdrop-blur-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80"
        >
          <span>Centre for Social Research</span>
          <span className="h-3.5 w-px bg-white/30" />
          <span>Trust &amp; Safety Forum</span>
        </motion.div>

        {/* Logo — uses intrinsic ~3.25:1 ratio, rendered with h-auto */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.08}
          className="mt-7 md:mt-9"
        >
          <Image
            src="/img/tasi-csr-logo.png"
            alt="Trust & Safety India Festival"
            width={650}
            height={200}
            priority
            className="w-[200px] sm:w-[280px] md:w-[370px] h-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] brightness-0 invert"
          />
        </motion.div>

        {/* Year + Edition */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.14}
          className="mt-3 flex items-center gap-3"
        >
          <span className="text-4xl md:text-5xl font-black tracking-tight text-white">2026</span>
          <span className="h-6 w-px bg-white/30" />
          <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white/70">2nd Edition</span>
        </motion.div>

        {/* Info chips */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          className="mt-6 md:mt-7 flex flex-wrap items-center justify-center gap-2.5"
        >
          {INFO_CHIPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-white/[0.08] border border-white/15 backdrop-blur-sm text-[13px] font-semibold text-white/90"
            >
              <Icon className="w-4 h-4 shrink-0 text-orange-300" strokeWidth={2} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.26}
          className="mt-7 md:mt-8 text-base md:text-xl font-semibold italic text-white/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]"
        >
          People First. Safety Always.
        </motion.p>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.32}
          className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-white/80 [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]"
        >
          From AI to digital rights, regulations, tech policy and algorithms,
          we invite the best of the industry to collaborate on emerging trends
          and create solutions in digital spaces.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.38}
          className="mt-8 md:mt-9 flex items-center justify-center gap-6 md:gap-10"
        >
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="w-5 h-5 text-orange-300/80 mb-1" strokeWidth={1.8} />
              <span className="text-2xl md:text-3xl font-black tracking-tight text-white">{value}</span>
              <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.15em] text-white/60">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.44}
          className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3"
        >
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
        </motion.div>

      </div>
    </section>
  );
}

