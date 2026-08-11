'use client';

import { useState } from 'react';

import ProgrammeAgendaClient from '@/components/programme/programme-agenda-client';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import EditionYearToggle from '@/components/ui/edition-year-toggle';

const heroContent = {
  2025: {
    title: 'TASI 2025 Agenda',
    description:
      'Explore sessions, speakers, and venue-wise programming across all festival days.',
  },
  2026: {
    title: 'TASI 2026 Agenda',
    description:
      'The working programme for 14-15 October 2026, curated around the theme "People First. Safety Always." Session titles are live and speakers are still being confirmed, so sessions, timings, and rooms may change.',
  },
};

export default function ProgrammePageClient({
  sessions,
  dayLabels,
  speakerDesignationMap,
  speakerPhotoMap,
  receptionNotes,
  sessions2026 = [],
  dayLabels2026,
  receptionNotes2026 = [],
  dayDateMap2026,
}) {
  const [year, setYear] = useState('2026');
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
          key="agenda-2025"
          sessions={sessions}
          dayLabels={dayLabels}
          speakerDesignationMap={speakerDesignationMap}
          speakerPhotoMap={speakerPhotoMap}
          receptionNotes={receptionNotes}
        />
      ) : (
        <ProgrammeAgendaClient
          key="agenda-2026"
          sessions={sessions2026}
          dayLabels={dayLabels2026}
          speakerDesignationMap={{}}
          speakerPhotoMap={{}}
          receptionNotes={receptionNotes2026}
          dayDateMap={dayDateMap2026}
        />
      )}
    </main>
  );
}
