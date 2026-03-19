import AboutPreview from "@/components/home/about-preview";
import AudienceSection from "@/components/home/audience-section";
import HomeFooter from "@/components/home/footer";
import FormatGrid from "@/components/home/format-grid";
import GlobalCta from "@/components/home/global-cta";
import FestivalHighlightsSection from "@/components/home/festival-highlights-section";
import HighlightsGallery from "@/components/home/highlights-gallery";
import HomeHero from "@/components/home/hero";
import HomeNavbar from "@/components/home/navbar";
import PartnersStrip from "@/components/home/partners-strip";
import StructureSection from "@/components/home/structure-section";
import ThemesPreview from "@/components/home/themes-preview";
import VideoTestimonialsSection from "@/components/home/video-testimonials-section";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <HomeHero />
        <FestivalHighlightsSection />
        <AboutPreview />
        <VideoTestimonialsSection />
        <FormatGrid />
        <StructureSection />
        <ThemesPreview />
        <AudienceSection />
        <PartnersStrip />
        <HighlightsGallery />
        <GlobalCta />
      </main>
      <HomeFooter />
    </>
  );
}
