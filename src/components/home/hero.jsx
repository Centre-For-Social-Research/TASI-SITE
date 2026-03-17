"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Countdown from "./countdown";
import TubesBackground from "./tubes-background";
import CountUpNumber from "../ui/count-up-number";

const pills = [
  "13-14th October 2026",
  "New Delhi, India",
  "1,000+ Delegates",
];

const heroHighlights = [
  {
    value: 500,
    suffix: "+",
    description: "Participants from government, civil society, diplomatic missions, and academia.",
  },
  {
    value: 100,
    suffix: "+",
    description: "Speakers and facilitators contributing practical expertise.",
  },
  {
    value: 15,
    description: "Countries represented in cross-border safety dialogue.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeHero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f6efe3_0%,#fff9ef_35%,#f4f1eb_100%)] dark:bg-[radial-gradient(circle_at_15%_20%,#111827_0%,#0b1022_40%,#070910_100%)]">
      {isDark ? (
        <TubesBackground className="absolute inset-0" enableClickInteraction />
      ) : null}

      <div className="pointer-events-none absolute inset-0 opacity-90 dark:hidden [background:radial-gradient(circle_at_top_right,_rgba(180,83,9,0.22),_transparent_32%),radial-gradient(circle_at_20%_20%,_rgba(251,191,36,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(15,118,110,0.14),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent dark:hidden" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-end">
        <div className="max-w-3xl">
          <motion.p
            className="mb-5 inline-flex items-center rounded-full border border-orange-300 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-800 dark:border-fuchsia-400/50 dark:bg-slate-950/70 dark:text-fuchsia-200"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.05}
          >
            Centre for Social Research · Trust and Safety Festival
          </motion.p>
          <motion.h1
            className="mb-4 text-5xl font-black leading-[0.94] tracking-tight text-stone-900 dark:text-white md:text-7xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.12}
          >
            Trust and Safety
            <span className="block text-orange-700 dark:text-cyan-300">India Festival</span>
          </motion.h1>
          <motion.p
            className="mb-3 max-w-2xl text-xl font-medium italic text-stone-600 dark:text-slate-200 md:text-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.18}
          >
            People First. Safety Always.
          </motion.p>
          <motion.p
            className="mb-6 max-w-2xl text-lg text-stone-700 dark:text-slate-100 md:text-xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.24}
          >
            From AI to digital rights, regulation, tech policy and algorithms, we bring together government, civil society, diplomatic missions, and industry to build safer digital spaces.
          </motion.p>

          <motion.div
            className="mb-6 flex flex-wrap gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.3}
          >
            {pills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 dark:border-slate-600 dark:bg-slate-950/65 dark:text-slate-100"
              >
                {pill}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="mb-8 flex flex-wrap gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.36}
          >
            <Link href="/register" className="rounded-md bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">
              Register Now
            </Link>
            <Link href="/sponsor" className="rounded-md border border-stone-400 px-5 py-3 font-semibold text-stone-800 hover:border-stone-700 dark:border-fuchsia-300/60 dark:text-fuchsia-100 dark:hover:border-fuchsia-300">
              Become a Sponsor
            </Link>
            <a
              href="https://drive.google.com/file/d/1oG8biMtiPTBxKnABevMPAOsqx2paykwS/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-emerald-400 px-5 py-3 font-semibold text-emerald-800 hover:border-emerald-600 dark:border-emerald-300/70 dark:text-emerald-100 dark:hover:border-emerald-300"
            >
              Download Brochure
            </a>
            <a
              href="https://drive.google.com/file/d/1S9dHlHQg8pm0-HjsjkXK0dwOSUCYqhxn/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-sky-400 px-5 py-3 font-semibold text-sky-800 hover:border-sky-600 dark:border-cyan-300/70 dark:text-cyan-100 dark:hover:border-cyan-300"
            >
              Read TASI 2025 Report
            </a>
          </motion.div>

          <motion.div
            className="grid max-w-3xl gap-4 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/55 dark:shadow-[0_30px_80px_rgba(8,8,18,0.7)] md:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.42}
          >
            {heroHighlights.map((item) => (
              <div key={item.description}>
                <CountUpNumber end={item.value} suffix={item.suffix || ""} className="text-3xl font-black text-stone-900 dark:text-white" />
                <p className="mt-1 text-sm text-stone-600 dark:text-slate-200">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -left-6 top-6 hidden h-24 w-24 rounded-full bg-amber-200/50 blur-2xl md:block" />
          <Countdown />
        </motion.div>
      </div>
    </section>
  );
}
