import HomeNavbar from "@/components/home/navbar";
import HomeFooter from "@/components/home/footer";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import RegistrationForm from "@/components/register/registration-form";
import { QR_PASS_RELEASE_TIMING } from "@/lib/registration-constants";

const steps = [
  {
    title: "Submit Your Application",
    details: "Complete the TASI 2026 form with your delegate details, LinkedIn profile, and profile photo.",
  },
  {
    title: "Team Review and Status Update",
    details: "Our reviewers will evaluate your application and notify you if you are confirmed, waitlisted, or not approved.",
  },
  {
    title: "QR Pass and Badge Pickup",
    details: `Confirmed attendees receive their QR-based entry pass ${QR_PASS_RELEASE_TIMING} and collect pre-printed badges at the venue.`,
  },
];

const faqs = [
  {
    question: "Will I be confirmed immediately after I register?",
    answer:
      "No. Every registration is reviewed by the TASI team. You will first receive a submission acknowledgment, followed by a later status email.",
  },
  {
    question: "When will confirmed attendees receive the QR pass?",
    answer:
      `Confirmed attendees will receive their QR-based entry pass by email ${QR_PASS_RELEASE_TIMING}.`,
  },
  {
    question: "What do I need to bring on event day?",
    answer:
      "Please carry your QR pass and any valid government-issued ID. The registration desk will scan the QR code before badge handover.",
  },
  {
    question: "Can I transfer my registration to someone else?",
    answer:
      "No. Registrations are strictly non-transferable and are valid only for the approved individual.",
  },
  {
    question: "What if I can no longer attend after being confirmed?",
    answer:
      "Please inform the organising team in advance so we can manage waitlisted attendees effectively.",
  },
];

export default function RegisterPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fbf6ee] pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">TASI 2026 Registration</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Apply First.
              <span className="block text-amber-200">Confirm Later.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              TASI 2026 follows an approval-based delegate process. Submission acknowledges your application, while
              confirmed attendees receive QR access closer to the event.
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 md:p-8">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Registration is open to government stakeholders, industry leaders, civil society, researchers,
                  students, media, and international participants aligned with trust and safety.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Every application is manually reviewed. If you are confirmed, your QR pass will be shared{" "}
                  {QR_PASS_RELEASE_TIMING} and your pre-printed badge will be available at the name-sorted
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
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.details}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/50">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">FAQ</h2>
                <div className="mt-5 space-y-3">
                  {faqs.map((item) => (
                    <details
                      key={item.question}
                      className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <summary className="cursor-pointer list-none pr-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
                    </details>
                  ))}
                </div>
                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                  Need support? Email{" "}
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
      </main>
      <HomeFooter />
    </>
  );
}
