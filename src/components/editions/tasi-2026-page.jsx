import Link from 'next/link';

import {
  Tasi2026AudienceSection,
  Tasi2026FormatSection,
  Tasi2026StructureSection,
  Tasi2026ThemesSection,
} from '@/components/editions/tasi-2026-sections';
import GlobalCta from '@/components/home/global-cta';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  tasi2026HeroActions,
  tasi2026HeroPills,
} from '@/data/tasi-2026-edition';

const actionClassNames = {
  primary:
    'rounded-full bg-rc-secondary px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-rc-primary transition hover:opacity-90',
  secondary:
    'rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/15',
};

export default function Tasi2026Page() {
  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero>
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/75">
              TASI Editions
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2026
              <span className="mt-2 block text-[1.15rem] font-extrabold text-rc-secondary dark:text-white md:text-[1.85rem]">
                Trust and Safety India Festival
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              Explore what to expect at TASI 2026, how the convening is
              structured, the strategic themes shaping the programme, and the
              leaders you&apos;ll meet across policy, industry, civil society,
              and global institutions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 pb-4">
              {tasi2026HeroPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {tasi2026HeroActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={actionClassNames[action.variant]}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </BrandedPageHero>

        <Tasi2026FormatSection />
        <Tasi2026StructureSection />
        <Tasi2026ThemesSection />
        <Tasi2026AudienceSection />
        <GlobalCta />
      </main>
    </>
  );
}
