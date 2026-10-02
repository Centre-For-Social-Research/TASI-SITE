'use client';

import { useState } from 'react';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';

import Reception2025Content from './reception-2025-content';
import Reception2026Update from './reception-2026-update';
import EditionYearToggle from '@/components/ui/edition-year-toggle';

const heroContent = {
  post: {
    title: 'Three Embassy Receptions.',
    subtitle: 'One diplomatic arc for digital safety.',
    description:
      'Explore the embassy-hosted reception journey of TASI 2025 across October 6-8 in New Delhi, from the pre-launch welcome evening to the closing diplomatic finale.',
    pills: [
      'October 6-8, 2025',
      'New Delhi diplomatic receptions',
      'Invite Only',
    ],
  },
  pre: {
    title: 'TASI 2026 Receptions.',
    subtitle: 'Three evenings around the festival.',
    description:
      'An opening reception hosted by the Embassy of France and the German Embassy, a private Match Group Policy Lab, and a closing reception hosted by the Embassy of the Kingdom of the Netherlands.',
    pills: ['13–15 October 2026', 'New Delhi', 'Invitation only'],
  },
};

export default function ReceptionsPage({ initialMode = 'pre' }) {
  const [mode, setMode] = useState(initialMode === 'pre' ? 'pre' : 'post');
  const hero = heroContent[mode];

  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-16 md:py-24">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-white/75">
              TASI Receptions
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {hero.title}
              <span className="mt-2 block text-[1.15rem] font-extrabold text-rc-secondary md:text-[1.9rem]">
                {hero.subtitle}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              {hero.description}
            </p>

            <div className="mt-8">
              <EditionYearToggle
                year={mode === 'post' ? '2025' : '2026'}
                onChange={(year) => setMode(year === '2025' ? 'post' : 'pre')}
              />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {hero.pills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </BrandedPageHero>

        {mode === 'post' ? <Reception2025Content /> : <Reception2026Update />}
      </main>
    </>
  );
}
