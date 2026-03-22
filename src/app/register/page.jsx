import HomeNavbar from "@/components/home/navbar";
import HomeFooter from "@/components/home/footer";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import ConfirmationEmailFlow from "@/components/register/confirmation-email-flow";

const steps = [
  {
    title: "Complete Registration",
    details: "Fill in your details and select your delegate category.",
  },
  {
    title: "QR Entry Pass (30 Days Prior)",
    details: "Your personalised QR-coded entry ticket will be emailed 30 days before the event.",
  },
  {
    title: "Attend TASI 2026",
    details: "Present your QR pass at venue entry; mobile check-in is accepted at all gates.",
  },
];

const faqs = [
  {
    question: "Who can register for TASI 2026?",
    answer:
      "Registration is open to policymakers, industry professionals, civil society organisations, researchers, media, and students aligned with trust and safety work.",
  },
  {
    question: "Will I receive a confirmation email after registering?",
    answer:
      "Yes. A confirmation email is sent after registration. If you do not receive it, use the confirmation request form on this page.",
  },
  {
    question: "When will I receive my QR entry pass?",
    answer:
      "Your QR-coded entry pass is issued to your registered email approximately 30 days before the event.",
  },
  {
    question: "Can I transfer my registration to someone else?",
    answer:
      "Registrations are typically non-transferable unless approved by the organising team. Please contact support for special cases.",
  },
  {
    question: "Who should I contact for registration help?",
    answer:
      "For support with registration, confirmation emails, or delegate categories, contact info1@csrindia.org.",
  },
];

export default function RegisterPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Join TASI 2026</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Secure Your<span className="block text-rc-secondary">Delegate Place</span>
            </h1>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Registration is open for all delegate categories. Upon registering you will receive an automated
              confirmation email with your unique delegate ID immediately.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Closer to the event, a QR-coded entry pass will be issued to your registered email as your ticket for
              seamless check-in at all sessions, receptions, and the Gala Dinner.
            </p>

            <div className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <article key={step.title} className="flex gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-slate-900 dark:text-slate-100">{step.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.details}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfqBWA1ILnAxbu2Dq-gEesIWB2sgFjhxqfhLJcerXXTIsuAkg/viewform?embedded=true"
              title="TASI 2026 Registration Form"
              className="block h-[1807px] w-full"
              loading="lazy"
              allow="geolocation; microphone; camera"
            >
              Loading registration form...
            </iframe>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          For participation enquiries, contact{" "}
          <a href="mailto:info1@csrindia.org" className="font-medium text-amber-700 hover:text-amber-800">
            info1@csrindia.org
          </a>
          .
        </p>

        <ConfirmationEmailFlow />

        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">FAQ</h2>
          <div className="mt-5 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <summary className="cursor-pointer list-none pr-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
    <HomeFooter />
    </>
  );
}
