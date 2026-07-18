'use client';

import { useState } from 'react';

import ProgrammeAgendaClient from '@/components/programme/programme-agenda-client';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import EditionYearToggle from '@/components/ui/edition-year-toggle';
import { MotionReveal } from '@/components/ui/motion-reveal';

const heroContent = {
  2025: {
    title: 'TASI 2025 Agenda',
    description:
      'Explore sessions, speakers, and venue-wise programming across all festival days.',
  },
  2026: {
    title: 'TASI 2026 Agenda',
    description:
      'The TASI 2026 programme is being curated around the theme "People First. Safety Always." Session details will be published here.',
  },
};

function Programme2026Update() {
  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
      <div className="mx-auto w-full max-w-[900px] px-4 md:px-8 lg:px-16">
        <MotionReveal>
          <article className="rounded-[10px] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.25)] md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-amber-300">
              Update
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-4xl">
              The 2026 programme will be announced soon.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-slate-300">
              We are curating sessions across 14 strategic themes for 14-15
              October 2026 at the India International Centre, New Delhi. Check
              back here for the full agenda, or propose a session of your own.
            </p>
            <a
              href="/speaker-application"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-rc-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-90"
            >
              Propose a Session
            </a>
          </article>
        </MotionReveal>
      </div>
    </section>
  );
}

export default function ProgrammePageClient({
  sessions,
  dayLabels,
  speakerDesignationMap,
  speakerPhotoMap,
  receptionNotes,
}) {
  const [year, setYear] = useState('2025');
  const hero = heroContent[year];

  return (
    <main className="bg-[#fdf6ef] dark:bg-stone-950">
      <BrandedPageHero className="py-14 md:py-20">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            Programme Overview
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-white/90">
            {hero.description}
          </p>
          <div className="mt-8">
            <EditionYearToggle year={year} onChange={setYear} />
          </div>
        </div>
      </BrandedPageHero>

      {year === '2025' ? (
        <ProgrammeAgendaClient
          sessions={sessions}
          dayLabels={dayLabels}
          speakerDesignationMap={speakerDesignationMap}
          speakerPhotoMap={speakerPhotoMap}
          receptionNotes={receptionNotes}
        />
      ) : (
        <Programme2026Update />
      )}
    </main>
  );
}
