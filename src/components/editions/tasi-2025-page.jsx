import Tasi2025Quotes from '@/components/editions/tasi-2025-quotes';
import {
  Tasi2025AboutSection,
  Tasi2025InauguralKeynoteSection,
  Tasi2025JourneySection,
  Tasi2025KeynotesSection,
  Tasi2025LookingAheadSection,
  Tasi2025RecommendationsSection,
  Tasi2025ResearchSpotlightsSection,
  Tasi2025TracksSection,
} from '@/components/editions/tasi-2025-sections';
import GlobalCta from '@/components/home/global-cta';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { tasi2025HeroPills } from '@/data/tasi-2025-edition';

export default function Tasi2025Page() {
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
              TASI 2025
              <span className="mt-2 block text-[1.15rem] font-extrabold text-rc-secondary dark:text-white md:text-[1.85rem]">
                Trust and Safety India Festival
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              A landmark two-day convening in New Delhi that brought together
              government leaders, global technology platforms, diplomats,
              researchers, and civil society to reimagine safer digital
              ecosystems.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {tasi2025HeroPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-7">
              <a
                href="https://drive.google.com/file/d/1S9dHlHQg8pm0-HjsjkXK0dwOSUCYqhxn/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full !bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] !text-[#140f26] transition hover:scale-[1.02] hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26]"
              >
                Read TASI 2025 Report
              </a>
            </div>
          </div>
        </BrandedPageHero>

        <Tasi2025AboutSection />
        <Tasi2025JourneySection />
        <Tasi2025KeynotesSection />
        <Tasi2025TracksSection />
        <Tasi2025InauguralKeynoteSection />
        <Tasi2025ResearchSpotlightsSection />
        <Tasi2025RecommendationsSection />
        <Tasi2025Quotes />
        <Tasi2025LookingAheadSection />
        <GlobalCta />
      </main>
    </>
  );
}
