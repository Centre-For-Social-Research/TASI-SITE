import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";
import SpeakersDirectory from "@/components/speakers/directory";

export default function SpeakersPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-14 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)] md:py-20">
          <DarkHeroParticles />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-300">Key Voices</p>
            <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-slate-100 md:text-6xl">
              Speakers from TASI 2025
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-stone-700 dark:text-slate-200">
              TASI 2025 featured 100+ speakers from government, industry, civil society, and international organisations. TASI 2026 speaker announcements coming soon.
            </p>
          </div>
        </section>
        <SpeakersDirectory />
      </main>
      <HomeFooter />
    </>
  );
}
