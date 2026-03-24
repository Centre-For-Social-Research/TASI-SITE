import HomeFooter from "@/components/home/footer";
import AudienceSection from "@/components/home/audience-section";
import FormatGrid from "@/components/home/format-grid";
import GlobalCta from "@/components/home/global-cta";
import HomeNavbar from "@/components/home/navbar";
import StructureSection from "@/components/home/structure-section";
import ThemesPreview from "@/components/home/themes-preview";
import BrandedPageHero from "@/components/ui/branded-page-hero";

export default function Tasi2026EditionPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero>
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/75">TASI Editions</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2026
              <span className="mt-2 block text-[1.15rem] font-extrabold text-rc-secondary md:text-[1.85rem]">
                Trust and Safety India Festival
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              Explore what to expect at TASI 2026, how the convening is structured, the strategic themes shaping the
              programme, and the leaders you&apos;ll meet across policy, industry, civil society, and global institutions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 pb-4">
              <span className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                13-14 October 2026
              </span>
              <span className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                New Delhi
              </span>
              <span className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                In person and online
              </span>
            </div>
          </div>
        </BrandedPageHero>
        <FormatGrid />
        <StructureSection />
        <ThemesPreview />
        <AudienceSection />
        <GlobalCta />
      </main>
      <HomeFooter />
    </>
  );
}
