'use client';

import { useState } from 'react';

import SpeakersDirectory from '@/components/speakers/directory';
import speakers2026 from '@/data/speakers-2026.json';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import EditionYearToggle from '@/components/ui/edition-year-toggle';

const heroContent = {
  2025: {
    title: 'Speakers from TASI 2025',
    description:
      'TASI 2025 featured 100+ speakers from government, industry, civil society, and international organisations.',
  },
  2026: {
    title: 'Speakers for TASI 2026',
    description:
      'Meet the speakers joining us in New Delhi to advance conversations on digital trust, safety, and AI governance.',
    updateNote:
      'This list will be updated as additional speakers are confirmed.',
  },
};

export default function SpeakersPageClient({ initialYear = '2026' }) {
  const [year, setYear] = useState(initialYear);
  const hero = heroContent[year];

  return (
    <main>
      <BrandedPageHero className="py-14 md:py-20">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            Key Voices
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-white/90">
            {hero.description}
          </p>
          {year === '2026' && (
            <p className="mx-auto mt-2 max-w-3xl font-semibold text-yellow-300">
              {hero.updateNote}
            </p>
          )}
          <div className="mt-8">
            <EditionYearToggle year={year} onChange={setYear} />
          </div>
        </div>
      </BrandedPageHero>

      <SpeakersDirectory
        key={year}
        speakerList={year === '2026' ? speakers2026 : undefined}
      />
    </main>
  );
}
