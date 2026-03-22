"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative flex py-section-lg min-h-[auto] md:min-h-[60vh] items-center justify-center overflow-hidden bg-black text-white px-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url('/img/hero-bg-2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />
      
      {/* Vignette Overlay to darken edges more firmly */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{
        background: "radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.5) 80%, rgba(0, 0, 0, 0.8) 100%)"
      }} />

      {/* Hero photo color overlay */}
      <div className="absolute inset-0 z-10 opacity-75" style={{
        background: "linear-gradient(0deg, rgb(63, 10, 10) 0%, rgb(115, 11, 78) 33%, rgb(204, 35, 20) 79%, rgb(222, 100, 22) 100%)"
      }} />

      <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center mt-4 md:mt-8">
        <motion.div
          className="mb-6 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 md:mb-8"
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0}
        >
          <span>Centre for Social Research</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/70 md:block" />
          <span>Trust &amp; Safety Forum</span>
        </motion.div>

        {/* Logo and Date Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full"
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0.1}
        >
          {/* Left Side: Logo equivalent */}
          <div className="text-right flex-1 flex justify-end">
            <h1 className="text-[3.5rem] md:text-[5.5rem] font-bold leading-[0.9] text-white tracking-tighter w-full md:w-auto text-center md:text-right flex flex-col items-center md:items-end justify-end">
              <span className="leading-[0.8] mb-2">TASI</span>
              <span className="text-[2.8rem] md:text-[4.2rem] font-black leading-[0.8] text-rc-secondary">2026</span>
            </h1>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-[2px] h-24 bg-white"></div>
          <div className="md:hidden h-[2px] w-24 bg-white my-2"></div>

          {/* Right Side: Location and Info */}
          <div className="text-left flex-1 flex justify-start">
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-[2.5rem] md:text-[4rem] font-black text-rc-secondary leading-none mb-3 tracking-tight drop-shadow-sm">
                Delhi
              </h2>
              <p className="text-sm md:text-base font-bold tracking-[0.15em] text-white mb-2">
                IN PERSON & ONLINE
              </p>
              <p className="text-sm md:text-base font-bold tracking-[0.15em] text-white">
                OCT 13 - 14, 2026
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-7 md:mt-8 flex flex-col items-center"
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0.3}
        >
          <p className="mb-3 text-base font-semibold italic text-white/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)] md:text-lg">
            People First. Safety Always.
          </p>
          <p className="mb-8 max-w-4xl text-sm leading-relaxed text-white/95 [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] md:text-lg">
            From AI to digital rights, regulations, tech policy and algorithms, we invite the best of the industry to
            collaborate on emerging trends and create solutions in digital spaces.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sponsor"
              className="inline-flex rounded-full border border-white/60 px-[28px] py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-white transition-all hover:bg-white hover:text-black"
            >
              Become a Sponsor
            </Link>
            <a
              href="https://drive.google.com/file/d/1oG8biMtiPTBxKnABevMPAOsqx2paykwS/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-rc-accent px-[28px] py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-rc-secondary transition-all hover:bg-rc-secondary hover:text-black"
            >
              Download Brochure
            </a>
            <a
              href="https://drive.google.com/file/d/1S9dHlHQg8pm0-HjsjkXK0dwOSUCYqhxn/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-rc-accent px-[28px] py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-rc-secondary transition-all hover:bg-rc-secondary hover:text-black"
            >
              Read TASI 2025 Report
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
