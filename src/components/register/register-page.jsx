import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  formatRegistrationReviewCopy,
  generalAccessIntro,
  paidTicketingIntro,
  registerPageHero,
  registerSupport,
  registrationFaqs,
  registrationOverview,
  registrationSteps,
} from '@/data/register-page';
import FestivalTicketingSection from './festival-ticketing-section';
import RegistrationForm from './registration-form';

export default function RegisterPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fbf6ee] pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              {registerPageHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {registerPageHero.title}
              <span className="block text-amber-200">
                {registerPageHero.titleAccent}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              {registerPageHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
          <div className="mb-8 rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              {generalAccessIntro.eyebrow}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {generalAccessIntro.description}
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 md:p-8">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {registrationOverview.audience}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {formatRegistrationReviewCopy()}
                </p>

                <div className="mt-8 space-y-4">
                  {registrationSteps.map((step, index) => (
                    <article
                      key={step.title}
                      className="flex gap-4 rounded-[10px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-900 dark:text-slate-100">
                          {step.title}
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {step.details}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/50">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
                  FAQ
                </h2>
                <div className="mt-5 space-y-3">
                  {registrationFaqs.map((item) => (
                    <details
                      key={item.question}
                      className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <summary className="cursor-pointer list-none pr-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                  {registerSupport.label}{' '}
                  <a
                    href={`mailto:${registerSupport.email}`}
                    className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    {registerSupport.email}
                  </a>
                  .
                </p>
              </section>
            </div>

            <RegistrationForm />
          </div>
        </section>

        <section className="relative mt-14 overflow-hidden bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-14 text-center md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,217,25,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
            <div className="flex items-center gap-4 text-white/75">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-[1.75rem] font-black uppercase tracking-[0.18em] text-amber-200">
                {paidTicketingIntro.dividerLabel}
              </span>
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <h2 className="mt-10 text-3xl font-black tracking-tight text-white md:text-5xl">
              {paidTicketingIntro.title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              {paidTicketingIntro.description}
            </p>
          </div>
        </section>

        <FestivalTicketingSection />
      </main>
    </>
  );
}
