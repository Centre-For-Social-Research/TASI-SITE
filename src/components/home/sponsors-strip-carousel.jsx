"use client";

import Image from "next/image";
import { partners } from "@/data/partners";

export default function SponsorsStripCarousel() {
  // We duplicate the partners list to create a seamless infinite loop.
  // We map enough items so the animation shifts smoothly from 0 to -50%.
  const repeatedPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white dark:bg-[#121212] pt-12 pb-7 md:pt-14 md:pb-8 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes sponsorMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-sponsor-marquee {
            animation: sponsorMarquee 80s linear infinite;
          }
          .animate-sponsor-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 mb-3 md:mb-4">
        <h3 className="text-xl md:text-3xl font-bold text-center text-[#14283c] dark:text-gray-200" style={{ fontFamily: "'Inter', sans-serif" }}>
          Partners From TASI 2025
        </h3>
      </div>

      <div className="mt-7 md:mt-8 flex w-max animate-sponsor-marquee gap-6 md:gap-8 px-4">
        {repeatedPartners.map((partner, index) => (
          <article
            key={`${partner.name}-${index}`}
            className="flex h-[110px] w-[220px] items-center justify-center shrink-0 rounded-[10px] border border-gray-100 p-5 shadow-sm"
            style={{ backgroundColor: "#ffffff" }}
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
