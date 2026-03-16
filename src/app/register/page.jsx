import DarkHeroParticles from "@/components/ui/dark-hero-particles";

const steps = [
  {
    title: "Complete Registration",
    details: "Fill in your details and select your delegate category.",
  },
  {
    title: "Instant Confirmation Email",
    details: "Receive a confirmation with your unique TASI 2026 delegate ID immediately.",
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

export default function RegisterPage() {
  return (
    <main className="bg-white pb-20 pt-28 text-slate-900 sm:pt-32">
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-12 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)]">
        <DarkHeroParticles />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">Join TASI 2026</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight dark:text-slate-100 sm:text-5xl">Secure Your Delegate Place</h1>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="text-lg leading-relaxed text-slate-700">
              Registration is open for all delegate categories. Upon registering you will receive an automated
              confirmation email with your unique delegate ID immediately.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Closer to the event, a QR-coded entry pass will be issued to your registered email as your ticket for
              seamless check-in at all sessions, receptions, and the Gala Dinner.
            </p>

            <div className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <article key={step.title} className="flex gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-slate-900">{step.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.details}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfqBWA1ILnAxbu2Dq-gEesIWB2sgFjhxqfhLJcerXXTIsuAkg/viewform?embedded=true"
              title="TASI 2026 Registration Form"
              className="block h-[1807px] w-full"
              loading="lazy"
            >
              Loading registration form...
            </iframe>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          For participation enquiries, contact{" "}
          <a href="mailto:info1@csrindia.org" className="font-medium text-amber-700 hover:text-amber-800">
            info1@csrindia.org
          </a>
          .
        </p>
      </section>
    </main>
  );
}
