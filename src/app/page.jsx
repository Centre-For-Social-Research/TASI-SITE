import HomeNavbar from '@/components/home/navbar';
import HomeHero from '@/components/home/hero';
import HomeQuickLinks from '@/components/home/home-quick-links';
import FestivalHighlightsSection from '@/components/home/festival-highlights-section';
import SpeakerCountriesMap from '@/components/home/speaker-countries-map';
import NewsUpdatesSection from '@/components/home/news-updates-section';
import SpeakerHighlightSection from '@/components/home/speaker-highlight-section';
import VideoTestimonialsSection from '@/components/home/video-testimonials-section';
import HighlightsGallery from '@/components/home/highlights-gallery';
import GlobalCta from '@/components/home/global-cta';
import FestivalHomeBand from '@/components/live/festival-home-band';
import { liveProgrammeSessions2026 } from '@/data/programme-2026';

export const revalidate = 60; // re-fetch Sanity data every 60 seconds

export const metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <HomeHero />
        <FestivalHomeBand sessions={liveProgrammeSessions2026} />
        <div className="bg-[radial-gradient(ellipse_at_80%_20%,#2a1a5e_0%,transparent_55%),linear-gradient(180deg,#0d0b1f_0%,#120a26_100%)]">
          <HomeQuickLinks />
          <SpeakerCountriesMap />
        </div>
        <div className="bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b]">
          <FestivalHighlightsSection />
        </div>
        <NewsUpdatesSection />
        <SpeakerHighlightSection />
        <VideoTestimonialsSection />
        <HighlightsGallery />
        <GlobalCta />
      </main>
    </>
  );
}
