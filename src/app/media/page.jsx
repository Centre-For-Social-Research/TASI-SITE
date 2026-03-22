import Image from "next/image";

import HomeFooter from "@/components/home/footer";
import MediaAccreditationSection from "@/components/media/media-accreditation-section";
import HomeNavbar from "@/components/home/navbar";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import { mediaCoverageEntries2025, mediaCoverageStats2025, mediaLogoWall2025 } from "@/data/media-coverage-2025";

export default function MediaPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] dark:bg-stone-950">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Media Coverage</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2025 In The Media
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Coverage highlights from the Trust and Safety Festival India 2025 report, spanning national press,
              digital outlets, broadcast, wires, and social platforms.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {mediaCoverageStats2025.map((item) => (
                <div
                  key={item.label}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm"
                >
                  <span className="font-black text-rc-secondary">{item.value}</span>
                  <span className="ml-2 text-white/85">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/downloads/tasi-2025-media-coverage-report.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#140f26] transition hover:scale-[1.02] hover:bg-white/90"
                >
                  Open Coverage Report
                </a>
                <a
                  href="/downloads/tasi-2025-media-coverage-dossier.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/15"
                >
                  Open Coverage Dossier
                </a>
              </div>
            </div>
          </div>
        </BrandedPageHero>

        <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3ece4_100%)] py-14 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent">Coverage List</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-5xl">
                  Selected media houses from the report
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-slate-300 md:text-base">
                  These entries are drawn from both PDF files you shared and grouped here as easy-to-scan coverage cards.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/downloads/tasi-2025-media-coverage-report.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-stone-900 transition hover:border-stone-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-500"
                >
                  Coverage Report
                </a>
                <a
                  href="/downloads/tasi-2025-media-coverage-dossier.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-stone-900 transition hover:border-stone-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-500"
                >
                  Coverage Dossier
                </a>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {mediaCoverageEntries2025.map((item) => (
                <article
                  key={`${item.publication}-${item.headline}`}
                  className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="rounded-xl bg-transparent px-3 py-2 dark:bg-white">
                      <div className="relative h-9 w-[150px]">
                        <Image
                          src={item.logo}
                          alt={item.publication}
                          fill
                          className="object-contain object-left"
                          sizes="150px"
                        />
                      </div>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-6 text-lg font-bold leading-relaxed text-stone-900 dark:text-white">{item.headline}</p>
                  <p className="mt-5 text-sm font-medium text-stone-500 dark:text-slate-400">{item.publication}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-slate-950 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent">Coverage Network</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 dark:text-white md:text-5xl">
                They attend and report
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-slate-300 md:text-base">
                A cross-section of publications, broadcasters, wires, and digital outlets that covered TASI 2025.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
              {mediaLogoWall2025.map((item) => (
                <div
                  key={item.publication}
                  className="flex min-h-[72px] items-center justify-center rounded-2xl bg-transparent px-3 py-2 transition-transform duration-200 hover:-translate-y-1 dark:bg-white"
                >
                  <div className="relative h-12 w-full max-w-[190px]">
                    <Image
                      src={item.logo}
                      alt={item.publication}
                      fill
                      className="object-contain"
                      sizes="(min-width: 1024px) 180px, (min-width: 768px) 30vw, 40vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MediaAccreditationSection />
      </main>
      <HomeFooter />
    </>
  );
}
