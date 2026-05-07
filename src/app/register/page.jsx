import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import FestivalTicketingSection from '@/components/register/festival-ticketing-section';
import RegistrationForm from '@/components/register/registration-form';
import { QR_PASS_RELEASE_TIMING } from '@/lib/registration-constants';

const steps = [
  {
    title: 'Submit Your Application',
    details:
      'Complete the TASI 2026 form with your delegate details, LinkedIn profile, and profile photo.',
  },
  {
    title: 'Team Review and Status Update',
    details:
      'Our reviewers will evaluate your application and notify you if you are confirmed, waitlisted, or not approved.',
  },
  {
    title: 'QR Pass and Badge Pickup',
    details: `Confirmed attendees receive their QR-based entry pass ${QR_PASS_RELEASE_TIMING} and collect pre-printed badges at the venue.`,
  },
];

const faqs = [
  {
    question: 'Will I be confirmed immediately after I register?',
    answer:
      'No. Every registration is reviewed by the TASI team. You will first receive a submission acknowledgment, followed by a later status email.',
  },
  {
    question: 'When will confirmed attendees receive the QR pass?',
    answer: `Confirmed attendees will receive their QR-based entry pass by email ${QR_PASS_RELEASE_TIMING}.`,
  },
  {
    question: 'What do I need to bring on event day?',
    answer:
      'Please carry your QR pass and any valid government-issued ID. The registration desk will scan the QR code before badge handover.',
  },
  {
    question: 'Can I transfer my registration to someone else?',
    answer:
      'No. Registrations are strictly non-transferable and are valid only for the approved individual.',
  },
  {
    question: 'What if I can no longer attend after being confirmed?',
    answer:
      'Please inform the organising team in advance so we can manage waitlisted attendees effectively.',
  },
];

export default function RegisterPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fbf6ee] pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              TASI 2026 Registration
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Apply First.
              <span className="block text-amber-200">Confirm Later.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              TASI 2026 follows an approval-based delegate process. Submission
              acknowledges your application, while confirmed attendees receive
              QR access closer to the event.
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
          <div className="mb-8 rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              Apply for General Access
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              This is a manual review process. Submit your application and our
              team will review your details. You will receive a confirmation if
              selected.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 md:p-8">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Registration is open to government stakeholders, industry
                  leaders, civil society, researchers, students, media, and
                  international participants aligned with trust and safety.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Every application is manually reviewed. If you are confirmed,
                  your QR pass will be shared {QR_PASS_RELEASE_TIMING} and your
                  pre-printed badge will be available at the name-sorted
                  registration desk.
                </p>

                <div className="mt-8 space-y-4">
                  {steps.map((step, index) => (
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
                  {faqs.map((item) => (
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
                  Need support? Email{' '}
                  <a
                    href="mailto:info1@csrindia.org"
                    className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    info1@csrindia.org
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
                OR
              </span>
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <h2 className="mt-10 text-3xl font-black tracking-tight text-white md:text-5xl">
              Skip the wait. Get full access to the festival.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              Move from application-only access to the full festival experience,
              including paid entry, hospitality, and reception access.
            </p>
          </div>
        </section>

        <FestivalTicketingSection />
      </main>
    </>
  );
}
