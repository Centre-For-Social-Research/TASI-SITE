import Link from "next/link";
import { MotionReveal } from "./motion-reveal";

export default function GlobalCta() {
  return (
    <section className="w-full bg-white dark:bg-gray-900 py-section-sm md:py-section-md px-4 border-t border-gray-100 dark:border-gray-800">
      <MotionReveal className="mx-auto flex flex-col items-center justify-center max-w-[90rem]">
        <h2 className="text-4xl font-semibold md:text-5xl lg:text-[4rem] tracking-tight bg-gradient-to-r from-[#350265] to-[#ffd919] dark:from-white dark:to-orange-300 bg-clip-text text-transparent pb-2 text-center">
          Be Part of the Conversation
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg md:text-[22px] text-gray-800 dark:text-gray-200 font-normal leading-relaxed text-center">
          Join 1,000+ delegates shaping the future of digital trust, safety and AI governance in India and beyond.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
          {/* Primary Button - Accent Orange */}
          <Link 
            href="/register" 
            className="flex w-full sm:min-w-[220px] sm:w-auto items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-2.5 text-[16px] font-bold leading-6 text-white transition-transform hover:scale-[1.02] hover:opacity-90"
          >
            Register
          </Link>
          
          {/* Secondary Button - Primary Purple */}
          <Link 
            href="/about" 
            className="flex w-full sm:min-w-[220px] sm:w-auto items-center justify-center rounded-3xl border border-rc-primary bg-rc-primary px-8 py-2.5 text-[16px] font-bold leading-6 text-rc-primary-foreground transition-transform hover:scale-[1.02] hover:opacity-90 dark:border-white dark:bg-white dark:text-slate-950"
          >
            Join our network
          </Link>

          {/* Tertiary Button - Accent Alternative */}
          <Link 
            href="/sponsor" 
            className="flex w-full sm:min-w-[220px] sm:w-auto items-center justify-center rounded-3xl bg-rc-primary px-8 py-2.5 text-[16px] font-bold leading-6 text-rc-primary-foreground transition-transform hover:scale-[1.02] hover:opacity-90 dark:bg-white dark:text-slate-950"
          >
            Partner with us
          </Link>
        </div>
      </MotionReveal>
    </section>
  );
}
