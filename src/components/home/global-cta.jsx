import Link from "next/link";
import { MotionReveal } from "./motion-reveal";

export default function GlobalCta() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#111827_0%,#1f2937_50%,#0f172a_100%)] py-16 text-white md:py-20">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_top,_rgba(251,191,36,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_24%)]" />
      <MotionReveal className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Be Part of the Conversation</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
          Join 1,000+ delegates shaping the future of digital trust, safety and AI governance in India and beyond.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-md bg-amber-100 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-200">
            Register for TASI 2026
          </Link>
          <Link href="/sponsor" className="rounded-md border border-white/40 px-5 py-3 font-semibold text-white transition hover:border-amber-300 hover:text-amber-200">
            Sponsorship Opportunities
          </Link>
        </div>
      </MotionReveal>
    </section>
  );
}