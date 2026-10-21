import Image from 'next/image';
import Link from 'next/link';

import {
  Tasi2026AboutSection,
  Tasi2026GallerySection,
  Tasi2026HighlightsVideoSection,
  Tasi2026IdeasSection,
  Tasi2026LaunchesSection,
  Tasi2026GetInvolvedSection,
  Tasi2026NumbersBand,
  Tasi2026RecommendationsSection,
  Tasi2026SessionsSection,
  Tasi2026VoicesSection,
} from '@/components/editions/tasi-2026-sections';
import HomeNavbar from '@/components/home/navbar';
import PartnersMarqueeStrip from '@/components/sponsor/partners-marquee-strip';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { tasi2026Partners } from '@/data/partners-2026';
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
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-white">
        <BrandedPageHero
          className="!pb-12 !pt-28 md:!pb-16 md:!pt-36"
          particles={false}
        >
          <div className="relative z-10 mx-auto grid w-full max-w-[1300px] items-center gap-10 px-4 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-16">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                TASI Editions / The 2026 Highlights
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                TASI 2026
                <span className="mt-4 block text-3xl font-extrabold leading-tight text-rc-secondary dark:text-white md:text-4xl">
                  People First.
                  <br />
                  Safety Always.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
                The second Trust and Safety India Festival brought government,
                platforms, researchers, civil society and young people together
                in New Delhi to shape a safer digital world.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 pb-4">
                {tasi2026HeroPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
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
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <figure className="col-span-2 overflow-hidden rounded-[10px] border border-white/20 bg-black/20">
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/img/tasi-2026/gallery-main-hall.webp"
                    alt="Delegates and panellists together in the Main Hall at TASI 2026"
                    fill
                    preload
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="px-4 py-3 text-xs font-medium text-white/85">
                  14–15 October 2026 · India International Centre, New Delhi
                </figcaption>
              </figure>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] border border-white/20">
                <Image
                  src="/img/tasi-2026/gallery-networking.webp"
                  alt="Delegates connecting between festival sessions"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] border border-white/20">
                <Image
                  src="/img/tasi-2026/idea-design-report-launch-group.webp"
                  alt="The Quantum Hub report launch on the TASI 2026 stage"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </BrandedPageHero>

        <Tasi2026NumbersBand />
        <nav
          aria-label="Explore the TASI 2026 recap"
          className="border-b border-stone-200 bg-white dark:border-slate-800 dark:bg-stone-950"
        >
          <div className="mx-auto flex max-w-[1300px] flex-wrap gap-x-7 gap-y-3 px-4 py-5 text-sm font-semibold text-rc-primary md:px-8 lg:px-16 dark:text-white">
            <a
              href="#festival-highlights"
              className="underline-offset-4 hover:underline"
            >
              Festival Film
            </a>
            <a
              href="#five-ideas"
              className="underline-offset-4 hover:underline"
            >
              Key Takeaways
            </a>
            <a href="#launches" className="underline-offset-4 hover:underline">
              Festival Announcements
            </a>
            <a href="#gallery" className="underline-offset-4 hover:underline">
              In Pictures
            </a>
            <a
              href="#get-involved"
              className="underline-offset-4 hover:underline"
            >
              Get Involved
            </a>
          </div>
        </nav>
        <Tasi2026HighlightsVideoSection />
        <Tasi2026AboutSection />
        <Tasi2026IdeasSection />
        <Tasi2026LaunchesSection />
        <Tasi2026VoicesSection />
        <Tasi2026SessionsSection />
        <Tasi2026RecommendationsSection />
        <Tasi2026GallerySection />
        <PartnersMarqueeStrip
          eyebrow="Our Network"
          title="Partners of TASI 2026"
          description="The organisations that partnered with us to make the second Trust and Safety India Festival possible."
          partners={tasi2026Partners}
        />
        <Tasi2026GetInvolvedSection />
      </main>
    </>
  );
}
