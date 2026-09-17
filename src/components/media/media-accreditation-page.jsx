import HomeNavbar from '@/components/home/navbar';
import MediaAccreditationSection from '@/components/media/media-accreditation-section';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  mediaAccreditationGuidance,
  mediaAccreditationHero,
  mediaAccreditationSteps,
} from '@/data/media-accreditation';

export default function MediaAccreditationPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] text-stone-950 dark:bg-stone-950 dark:text-white">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              {mediaAccreditationHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {mediaAccreditationHero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
              {mediaAccreditationHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <section className="bg-[linear-gradient(180deg,#fff8ef_0%,#f3ece4_100%)] py-12 dark:bg-[linear-gradient(180deg,#171717_0%,#0f172a_100%)] md:py-16">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
            <aside className="flex min-w-0 flex-col gap-5">
              <article className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-900 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-rc-accent dark:text-orange-300">
                  Press access
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                  {mediaAccreditationGuidance.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-slate-300">
                  {mediaAccreditationGuidance.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {mediaAccreditationGuidance.notes.map((note) => (
                    <li
                      key={note}
                      className="flex gap-3 text-sm leading-relaxed text-stone-700 dark:text-slate-300"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rc-accent"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="flex flex-1 flex-col rounded-[10px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-900 md:p-7">
                <h2 className="text-xl font-black tracking-tight text-stone-950 dark:text-white">
                  What happens next
                </h2>
                <ol className="mt-5 space-y-4">
                  {mediaAccreditationSteps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4d116d] text-sm font-black text-white dark:bg-fuchsia-700">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.08em] text-stone-900 dark:text-white">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <a
                  href="/media"
                  className="mt-auto inline-flex pt-6 text-sm font-bold text-[#4d116d] underline decoration-2 underline-offset-4 dark:text-fuchsia-300"
                >
                  View the TASI media centre
                </a>
              </article>
            </aside>

            <MediaAccreditationSection />
          </div>
        </section>
      </main>
    </>
  );
}
