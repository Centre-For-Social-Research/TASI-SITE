import HomeFooter from '@/components/home/footer';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';

const pressReleaseFiles = [
  {
    title:
      "Trust & Safety India Festival 2025 Launches in New Delhi, Showcasing India's Global Leadership in Digital Trust",
    description: 'Launch-day press release in PDF format.',
    href: '/downloads/tasi-2025-launch-press-release.pdf',
    type: 'PDF',
  },
  {
    title: 'Media Invite - Trust and Safety India Festival 2025',
    description: 'Media invitation shared for TASI 2025 coverage planning.',
    href: '/downloads/media-invite-tasi-2025.pdf',
    type: 'PDF',
  },
  {
    title: 'Press Conference - Flow of Events',
    description: 'Run-of-show document for press conference coordination.',
    href: '/downloads/press-conference-flow-of-events.pdf',
    type: 'PDF',
  },
  {
    title:
      'Trust & Safety India Festival 2025 Spotlights Digital Leadership and Collaborative Innovation on Day 2',
    description: 'Day 2 festival press release in PDF format.',
    href: '/downloads/tasi-2025-day-2-press-release.pdf',
    type: 'PDF',
  },
];

export default function MediaPressReleasesPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] dark:bg-stone-950">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Media Resources
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Press Releases
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Official release documents, media invites, and press coordination
              material from the TASI 2025 cycle.
            </p>
          </div>
        </BrandedPageHero>

        <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3ece4_100%)] py-14 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pressReleaseFiles.map((file) => (
                <article
                  key={file.href}
                  className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-[10px] bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-stone-700 dark:bg-slate-800 dark:text-slate-200">
                      {file.type}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
                      Press Release
                    </span>
                  </div>
                  <h2 className="mt-5 font-serif text-[1.14rem] font-medium leading-relaxed text-stone-950 dark:text-white md:text-[1.25rem]">
                    {file.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                    {file.description}
                  </p>
                  <div className="mt-6">
                    <a
                      href={file.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-[10px] border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:border-stone-500 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-800"
                    >
                      Open Document
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
