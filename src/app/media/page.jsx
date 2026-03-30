import Image from 'next/image';

import HomeFooter from '@/components/home/footer';
import MediaAccreditationSection from '@/components/media/media-accreditation-section';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  mediaCoverageEntries2025,
  mediaLogoWall2025,
} from '@/data/media-coverage-2025';

const mediaResources = [
  {
    title: 'Press Releases',
    description:
      'Follow TASI announcements, festival updates, and major media moments from the latest event cycle.',
    image: '/img/home-gallery/tasi-2026-brochure-3.png',
    imageAlt: 'TASI brochure and press material',
    actions: [{ label: 'Open Press Releases', href: '/media/press-releases' }],
  },
  {
    title: 'Press Kit',
    description:
      'Access the coverage report and media dossier for quick background, event context, and newsroom reference.',
    image: '/img/home-gallery/highlight-2.webp',
    imageAlt: 'Event production and media setup',
    actions: [{ label: 'Open Press Kit', href: '/media/press-kit' }],
  },
  {
    title: 'Press Conference',
    description:
      'Reach the TASI team for interviews, speaking requests, and on-site media coordination ahead of the event.',
    image: '/img/home-gallery/7T7A9837.webp',
    imageAlt: 'Conference session at TASI',
    actions: [{ label: 'Media Accreditation', href: '#media-accreditation' }],
  },
  {
    title: 'Photo Gallery',
    description:
      'Browse event imagery, audience moments, and festival highlights from the visual archive already on the site.',
    image: '/img/home-gallery/7T7A0651.webp',
    imageAlt: 'Attendees at a TASI event',
    actions: [
      {
        label: 'Browse Gallery',
        href: 'https://drive.google.com/drive/folders/1mbrq_mhqsb-8HG5Fqy0om7pKObOwIPjt?usp=sharing',
        external: true,
      },
    ],
  },
];

export default function MediaPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] dark:bg-stone-950">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Media Coverage
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2025 In The Media
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Coverage highlights from the Trust and Safety Festival India 2025
              report, spanning national press, digital outlets, broadcast,
              wires, and social platforms.
            </p>
            <div className="mt-7">
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/downloads/tasi-2025-media-coverage-report.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full !bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] !text-[#140f26] transition hover:scale-[1.02] hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26]"
                >
                  Open Coverage Report
                </a>
                <a
                  href="/downloads/tasi-2025-media-coverage-dossier.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/15 dark:border-white/40 dark:hover:bg-white/20"
                >
                  Open Coverage Dossier
                </a>
              </div>
            </div>
          </div>
        </BrandedPageHero>

        <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3ece4_100%)] py-14 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
                Coverage List
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-5xl">
                Selected Report From Media House
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-slate-300 md:text-base">
                Explore key highlights, articles, and insights directly
                published by leading media outlets detailing the impact and
                reach of TASI.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {mediaCoverageEntries2025.map((item) => (
                <a
                  key={`${item.publication}-${item.headline}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-[10px] bg-transparent px-3 py-2 dark:bg-white">
                      <div className="relative h-9 w-[132px] md:w-[150px]">
                        <Image
                          src={item.logo}
                          alt={item.publication}
                          fill
                          className="object-contain object-left"
                          sizes="(min-width: 768px) 150px, 132px"
                        />
                      </div>
                    </div>
                    <span className="ml-auto inline-flex shrink-0 whitespace-nowrap rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 md:px-3 md:text-[11px]">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-6 font-serif text-[1.12rem] font-medium leading-relaxed text-stone-900 dark:text-white md:text-[1.2rem]">
                    {item.headline}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-500 dark:text-slate-400">
                      {item.publication}
                    </p>
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-rc-primary dark:text-white">
                      Open Source
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-slate-950 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
                Coverage Network
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 dark:text-white md:text-5xl">
                They attend and report
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-slate-300 md:text-base">
                A cross-section of publications, broadcasters, wires, and
                digital outlets that covered TASI 2025.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
              {mediaLogoWall2025.map((item) => (
                <div
                  key={item.publication}
                  className="flex min-h-[72px] items-center justify-center rounded-[10px] bg-transparent px-3 py-2 transition-transform duration-200 hover:-translate-y-1 dark:bg-white"
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

        <section className="bg-[linear-gradient(180deg,#fffdfa_0%,#f5efe7_100%)] py-12 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-stone-950 dark:text-white md:text-5xl">
                Resources
              </h2>
              <div className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-[#ff4d7a] via-[#d21f76] to-[#f05f32]" />
              <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-stone-700 dark:text-slate-300 md:text-base">
                Don&apos;t miss the latest TASI media material. Everything here
                is designed to help journalists, editors, and event partners
                prepare coverage quickly.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {mediaResources.map((item) => (
                <article
                  key={item.title}
                  className="group mx-auto flex h-full w-full max-w-[280px] flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_16px_42px_-30px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_-34px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative aspect-[1.45/1] w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1280px) 280px, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-4 pb-5 pt-4 text-center">
                    <h3 className="text-lg font-black tracking-tight text-stone-950 dark:text-white md:text-[1.2rem]">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-700 dark:text-slate-300 md:text-[14px]">
                      {item.description}
                    </p>

                    <div className="mt-5 flex flex-col items-center gap-2">
                      {item.actions.map((action) => (
                        <a
                          key={action.label}
                          href={action.href}
                          target={action.external ? '_blank' : undefined}
                          rel={action.external ? 'noreferrer' : undefined}
                          className="inline-flex min-h-9 items-center justify-center rounded-full border border-stone-400 bg-white px-3.5 py-1.5 text-[13px] font-medium text-stone-800 transition hover:border-stone-700 hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-slate-400 dark:hover:bg-slate-800"
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
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
