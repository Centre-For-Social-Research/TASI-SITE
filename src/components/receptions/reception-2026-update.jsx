'use client';

import { MotionReveal } from '@/components/ui/motion-reveal';

export default function Reception2026Update() {
  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
      <div className="mx-auto w-full max-w-[900px] px-4 md:px-8 lg:px-16">
        <MotionReveal>
          <article className="rounded-[10px] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.25)] md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-amber-300">
              Update
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Reception details will be updated soon.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-slate-300">
              We will share the full 2026 receptions information here once the
              programme is finalized.
            </p>
          </article>
        </MotionReveal>
      </div>
    </section>
  );
}
