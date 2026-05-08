import Link from 'next/link';
import HomeNavbar from '@/components/home/navbar';
import InvolvementCard from '@/components/get-involved/involvement-card';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  getInvolvedHero,
  getInvolvedQuickLinks,
  getInvolvedTailoredCta,
  involvementBestFits,
  involvementOptions,
} from '@/data/get-involved-page';

export default function GetInvolvedPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] pb-20 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {getInvolvedHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {getInvolvedHero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              {getInvolvedHero.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {getInvolvedQuickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-10 max-w-7xl px-6 sm:px-8">
          <div className="px-2 py-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-white">
              Participation Paths
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
              How will you shape your impact at TASI?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-stone-600 dark:text-slate-300 md:text-base">
              From speaking and sponsorship to media access, delegations, and
              partner-led moments, we&apos;ll help you find the format that best
              fits your goals.
            </p>

            <div className="mt-10 grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
              {involvementOptions.map((item) => (
                <InvolvementCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[10px] border border-stone-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-white">
                Best Fits
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                Built for cross-sector participation, not one narrow audience
              </h2>
              <div className="mt-6 grid gap-3">
                {involvementBestFits.map((item) => (
                  <div
                    key={item}
                    className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-relaxed text-stone-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-stone-200 bg-[linear-gradient(145deg,#111827,#1f2937,#7c2d12)] px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">
                {getInvolvedTailoredCta.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {getInvolvedTailoredCta.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                {getInvolvedTailoredCta.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {getInvolvedTailoredCta.actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={
                      action.primary
                        ? 'inline-flex items-center rounded-[10px] !bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] !text-[#140f26] transition hover:!bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:!bg-white dark:!text-[#140f26]'
                        : 'inline-flex items-center rounded-[10px] border border-white/20 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:!bg-white hover:!text-[#140f26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:hover:!bg-white dark:hover:!text-[#140f26]'
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
