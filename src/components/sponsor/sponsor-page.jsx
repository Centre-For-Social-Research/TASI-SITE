import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import PartnersMarqueeStrip from '@/components/sponsor/partners-marquee-strip';
import {
  SponsorAdvantagesSection,
  SponsorPartnerOptionsSection,
  SponsorStorySection,
  SponsorshipTiersSection,
} from '@/components/sponsor/sponsor-sections';
import { sponsorHero } from '@/data/sponsor-page';

export default function SponsorPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-10 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {sponsorHero.eyebrow}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-6xl">
              {sponsorHero.title}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              {sponsorHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <SponsorStorySection />
        <SponsorAdvantagesSection />
        <SponsorshipTiersSection />
        <SponsorPartnerOptionsSection />
        <PartnersMarqueeStrip />
      </main>
    </>
  );
}
