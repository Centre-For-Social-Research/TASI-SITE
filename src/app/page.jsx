import AboutPreview from "@/components/home/about-preview";
import AudienceSection from "@/components/home/audience-section";
import HomeFooter from "@/components/home/footer";
import FormatGrid from "@/components/home/format-grid";
import GlobalCta from "@/components/home/global-cta";
import FestivalHighlightsSection from "@/components/home/festival-highlights-section";
import HighlightsGallery from "@/components/home/highlights-gallery";
import HomeHero from "@/components/home/hero";
import HomeNavbar from "@/components/home/navbar";
import ImmersiveVideoShowcase from "@/components/past-editions/immersive-video-showcase";
import StructureSection from "@/components/home/structure-section";
import ThemesPreview from "@/components/home/themes-preview";

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
        <ImmersiveVideoShowcase />
        <FormatGrid />
        <StructureSection />
        <ThemesPreview />
        <AudienceSection />
        <HighlightsGallery />
        <GlobalCta />
      </main>
      <HomeFooter />
    </>
  );
}
