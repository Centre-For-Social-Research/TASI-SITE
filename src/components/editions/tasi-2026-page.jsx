import Link from 'next/link';

import Tasi2026Gallery from '@/components/editions/tasi-2026-gallery';
import {
  Tasi2026ArticleSection,
  Tasi2026ChiefGuestSection,
  Tasi2026DayStoriesSection,
  Tasi2026HighlightsVideoSection,
  Tasi2026LaunchesSection,
  Tasi2026RecommendationsSection,
  Tasi2026SpeakersWallSection,
  Tasi2026VoicesSection,
} from '@/components/editions/tasi-2026-sections';
import HomeNavbar from '@/components/home/navbar';
import PartnersMarqueeStrip from '@/components/sponsor/partners-marquee-strip';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { tasi2026AllPartners } from '@/data/partners-2026';
import {
  tasi2026HeroActions,
  tasi2026HeroPills,
} from '@/data/tasi-2026-edition';

const actionClassNames = {
  primary:
    'inline-flex rounded-full !bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] !text-[#140f26] transition hover:scale-[1.02] hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26]',
  secondary:
    'inline-flex rounded-full border border-white/40 px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:scale-[1.02] hover:bg-white/10',
};

export default function Tasi2026Page() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
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
              The second edition brought government, platforms, researchers,
              civil society and young people together in New Delhi under the
              theme People First. Safety Always.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {tasi2026HeroPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
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

        <Tasi2026HighlightsVideoSection />
        <Tasi2026DayStoriesSection />
        <Tasi2026ChiefGuestSection />
        <Tasi2026LaunchesSection />
        <Tasi2026RecommendationsSection />
        <Tasi2026VoicesSection />
        <Tasi2026ArticleSection />
        <Tasi2026SpeakersWallSection />
        <Tasi2026Gallery />
        <PartnersMarqueeStrip
          eyebrow="Our Network"
          title="Partners of TASI 2026"
          description="The organisations that partnered with us to make the second Trust and Safety India Festival possible."
          partners={tasi2026AllPartners}
        />
      </main>
    </>
  );
}
