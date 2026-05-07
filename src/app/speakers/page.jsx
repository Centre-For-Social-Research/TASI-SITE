import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import SpeakersDirectory from '@/components/speakers/directory';

export const revalidate = 3600;

export default function SpeakersPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Key Voices
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Speakers from TASI 2025
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              TASI 2025 featured 100+ speakers from government, industry, civil
              society, and international organisations. TASI 2026 speaker
              announcements coming soon.
            </p>
          </div>
        </BrandedPageHero>
        <SpeakersDirectory />
      </main>
    </>
  );
}
