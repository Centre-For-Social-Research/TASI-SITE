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
        <div className="bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b]">
          <HomeQuickLinks />
          <SpeakerCountriesMap />
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
