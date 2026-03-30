'use client';

import Image from 'next/image';
import { partners } from '@/data/partners';

export default function SponsorsStripCarousel() {
  // We duplicate the partners list to create a seamless infinite loop.
  // We map enough items so the animation shifts smoothly from 0 to -50%.
  const repeatedPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-white pt-12 pb-7 font-['Inter',sans-serif] dark:bg-[#121212] md:pt-14 md:pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 mb-3 md:mb-4">
        <h3 className="text-center text-xl font-bold text-[#14283c] dark:text-gray-200 md:text-3xl">
          Partners From TASI 2025
        </h3>
      </div>

      <div className="animate-sponsor-marquee mt-7 flex w-max gap-6 px-4 md:mt-8 md:gap-8">
        {repeatedPartners.map((partner, index) => (
          <article
            key={`${partner.name}-${index}`}
            className="flex h-[110px] w-[220px] shrink-0 items-center justify-center rounded-[10px] border border-gray-100 bg-[#ffffff] p-5 shadow-sm"
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              width={180}
              height={70}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
