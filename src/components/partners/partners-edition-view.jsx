'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import EditionYearToggle from '@/components/ui/edition-year-toggle';

// Hero and logo grid for one TASI edition, switched like the speakers and
// receptions pages. The server passes in the copy and slim partner lists.
export default function PartnersEditionView({
  initialYear,
  eyebrow,
  heroByYear,
  partnersByYear,
  sessionPartnersByYear = {},
  sessionSection,
}) {
  const [year, setYear] = useState(initialYear);
  const hero = heroByYear[year];
  const partners = partnersByYear[year];
  const sessionPartners = sessionPartnersByYear[year] || [];

  return (
    <>
      <BrandedPageHero className="min-h-[300px] py-14 md:min-h-[360px] md:py-20">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-white/90">
            {hero.description}
          </p>
          {hero.updateNote ? (
            <p className="mx-auto mt-2 max-w-3xl font-semibold text-yellow-300">
              {hero.updateNote}
            </p>
          ) : null}
          <div className="mt-8">
            <EditionYearToggle year={year} onChange={setYear} />
          </div>
        </div>
      </BrandedPageHero>

      <section className="py-14 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((partner) => (
              <PartnerCard key={partner.slug} partner={partner} />
            ))}
          </div>

          {sessionPartners.length > 0 && sessionSection ? (
            <div className="mt-16 border-t border-stone-200 pt-14 dark:border-slate-800 md:mt-20 md:pt-16">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
                  {sessionSection.title}
                </h2>
                <p className="mt-3 text-stone-600 dark:text-slate-300">
                  {sessionSection.description}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                {sessionPartners.map((partner) => (
                  <PartnerCard key={partner.slug} partner={partner} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

function PartnerCard({ partner }) {
  return (
    <Link
      href={`/partners/${partner.slug}`}
      className="group flex w-[210px] shrink-0 flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-stone-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg forced-color-adjust-none [color-scheme:light]"
    >
      <div className="flex min-h-[14rem] flex-1 items-center justify-center bg-white px-6 py-8">
        <Image
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          width={160}
          height={80}
          className="h-16 w-auto max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="mt-auto flex h-[72px] flex-col justify-center bg-[#C8177A] px-4 py-3">
        <p className="line-clamp-1 text-[13px] font-bold leading-tight text-white">
          {partner.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/80">
          {partner.category}
        </p>
      </div>
    </Link>
  );
}
