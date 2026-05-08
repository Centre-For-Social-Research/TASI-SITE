import HomeNavbar from '@/components/home/navbar';
import HomeHero from '@/components/home/hero';
import FestivalHighlightsSection from '@/components/home/festival-highlights-section';
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
        <FestivalHighlightsSection />
        <NewsUpdatesSection />
        <SpeakerHighlightSection />
        <VideoTestimonialsSection />
        <HighlightsGallery />
        <GlobalCta />
      </main>
    </>
  );
}
