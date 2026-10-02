import Link from 'next/link';
import Image from 'next/image';
import { partners as currentPartners } from '@/data/partners';

const partnerPageSlugs = new Set(currentPartners.map(({ slug }) => slug));

// Tile widths for 3 / 4 / 6 per row, net of the gaps (gap-3, then gap-4 from
// sm), so a wrapping flex row centres a short last row for any list length.
const logoTileClass =
  'forced-color-adjust-none [color-scheme:light] flex min-h-20 w-[calc((100%-1.5rem)/3)] items-center justify-center rounded-[10px] border border-white/10 !bg-white px-3 py-3 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.65)] dark:!bg-white sm:min-h-24 sm:w-[calc((100%-2rem)/3)] sm:px-4 sm:py-4 md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)]';

// Shared logo grid. The sponsor page uses the current partner list; edition
// pages pass their own fixed list. A logo links to its partner page only
// while that page exists.
export default function PartnersMarqueeStrip({
  eyebrow = 'Our Network',
  title = 'Partners from TASI 2025',
  description = 'A growing network of organizations already shaping the trust and safety conversation around TASI.',
  partners = currentPartners,
}) {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[linear-gradient(180deg,#160325_0%,#26053a_46%,#4f0d53_100%)] py-12 text-white md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,217,25,0.14),transparent_40%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          {partners.map((partner) => {
            const logo = (
              <Image
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                width={120}
                height={48}
                className="h-10 w-full object-contain sm:h-11"
                quality={80}
              />
            );
            return partnerPageSlugs.has(partner.slug) ? (
              <Link
                key={partner.slug}
                href={`/partners/${partner.slug}`}
                className={`${logoTileClass} transition-transform hover:-translate-y-0.5`}
              >
                {logo}
              </Link>
            ) : (
              <div key={partner.slug} className={logoTileClass}>
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
