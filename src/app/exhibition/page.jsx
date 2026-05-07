import Image from 'next/image';

import GlobalCta from '@/components/home/global-cta';
import HomeNavbar from '@/components/home/navbar';
import ExhibitionEnquiryForm from '@/components/exhibition/exhibition-enquiry-form';
import BrandedPageHero from '@/components/ui/branded-page-hero';

const proofPoints = [
  {
    title: 'Decision-Makers in the Room',
    body: 'Position your organisation alongside policymakers, platforms, researchers, and public-interest leaders already engaged in live trust and safety dialogue.',
  },
  {
    title: 'A Curated Showcase',
    body: 'Present inside a designed environment that feels premium, composed, and fully integrated into the event rather than set apart from it.',
  },
  {
    title: 'Lasting Recall',
    body: 'Use exhibition, hosting, and visibility moments to turn on-site presence into conversation, trust, and follow-up interest.',
  },
];

const participationModes = [
  {
    title: 'Showcase Pavilion',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.09 PM.webp',
    alt: 'Premium exhibition booth concepts for TASI 2026',
    body: 'A branded presence designed for sharper storytelling, one-to-one engagement, and a strong first impression on the floor.',
    fit: 'Ideal for product platforms, service providers, and mission-led organisations seeking a premium physical footprint.',
  },
  {
    title: 'Signature Display',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.18 PM.webp',
    alt: 'Premium partner wall concept for TASI 2026',
    body: 'An architectural display format that signals prestige, ecosystem participation, and visible association with the festival.',
    fit: 'Best for institutions, alliances, and organisations that want a more elevated visibility play.',
  },
  {
    title: 'Ecosystem Display Wall',
    image: '/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.17 PM.webp',
    alt: 'A wooden architectural grid displaying partner and sponsor logos for TASI',
    body: 'A towering structural grid that prominently highlights an alliance of technology platforms, institutions, and civil society organizations driving the trust and safety dialogue.',
    fit: 'Best for partners seeking high-visibility brand association alongside other industry leaders right at the heart of the festival environment.',
  },
];

const extendedBranding = [
  {
    title: 'Speaker & Delegate Kits',
    image: '/img/Exhibition/IMG_5848fwe.webp',
    alt: 'TASI 2025 speaker badges and lanyards',
    body: 'Prominent brand visibility natively integrated into the official accreditation passes, welcome kits, and lanyards handed to all speakers and attendees.',
    imageClassName: 'object-cover',
  },
  {
    title: 'Digital Standees & Kiosks',
    image: '/img/Exhibition/Untitled design (95).webp',
    alt: 'TASI 2025 digital schedule standees and partner boards',
    body: 'Dynamic digital visibility on high-traffic information standees, interactive schedule kiosks, and focal displays placed strategically throughout the venue.',
    imageClassName: 'object-cover object-center',
  },
  {
    title: 'Venue Signage & Welcome Boards',
    image: '/img/Exhibition/7T7A3132.webp',
    alt: 'TASI 2025 partner recognition welcome board in the entrance lobby',
    body: 'Premium placement on primary welcome boards, directional signage, and lobby displays that form the first impression for arriving attendees.',
    imageClassName: 'object-cover object-center',
  },
  {
    title: 'Main Stage & Digital Screens',
    image: '/img/Exhibition/7T7A3136.webp',
    alt: 'TASI 2025 main stage backdrop and digital screens',
    body: 'High-impact visibility on the primary session screens, holding slides, and stage backdrops during keynotes and major panels.',
  },
];

export default function ExhibitionPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-10 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              TASI 2026
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-6xl">
              Participation & Exhibition
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              An enquiry-led invitation for organisations that want to show up
              inside India&apos;s leading trust and safety gathering with more
              relevance, more presence, and more intent.
            </p>
          </div>
        </BrandedPageHero>

        <section className="bg-white py-section-md dark:bg-[#121212] md:py-section-lg">
          <div className="container mx-auto max-w-[1300px] px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="mb-2 text-body-xs font-semibold uppercase tracking-widest text-[#5c0f4f] dark:text-rc-secondary">
                  Branding Opportunities
                </p>
                <h2 className="mb-5 text-stone-900 text-display-lg font-black dark:text-white">
                  Looking beyond the booth to the broader potential of TASI 2026
                </h2>
                <div className="space-y-6 text-body-md leading-relaxed text-stone-700 dark:text-stone-300">
                  <p>
                    Rather than a generic expo room, the physical language of
                    TASI creates an environment where ecosystem brands can
                    natively host their own dialogues. Past activations have
                    demonstrated how impactful direct, in-event physical
                    footprints can be when merged with core session content.
                  </p>
                  <p>
                    For 2026, exhibition spaces span from premium central
                    pavilions to intimate brand walls, each crafted using sleek
                    lines, timber accents, and clean lighting to ensure
                    organizational credibility.
                  </p>
                </div>
              </div>
              <div className="relative">
                <article className="overflow-hidden rounded-[10px] border border-stone-200 bg-gray-50 shadow-lg shadow-stone-200/30 dark:border-stone-800 dark:bg-gray-900/50">
                  <Image
                    src="/img/Exhibition/WhatsApp Image 2026-04-14 at 8.17.16 PM.webp"
                    alt="Lounge and stage layout displaying event branding opportunities"
                    width={1000}
                    height={700}
                    className="w-full object-cover"
                  />
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] px-6 py-section-sm md:px-6 md:py-section-md lg:px-16 lg:py-section-lg">
          <div className="mx-auto grid w-full max-w-[1300px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
            <div className="text-white">
              <span className="mb-4 block text-xs font-black uppercase tracking-widest text-rc-secondary dark:text-white md:text-sm">
                Flagship Pavilion
              </span>
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.2rem]">
                A premium space for organisations shaping{' '}
                <span className="text-rc-secondary dark:text-white">
                  digital trust.
                </span>
              </h2>
              <div className="mt-8 space-y-6 text-base leading-[1.65] text-white/90 md:text-[17px]">
                <p>
                  TASI exhibition participation is designed for organisations
                  that want to meet the right people, occupy a thoughtfully
                  staged environment, and leave with more than logo visibility.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#exhibition-enquiry"
                    className="inline-flex items-center justify-center rounded-3xl bg-white px-8 py-2.5 text-[16px] font-bold text-[#140f26] transition-transform hover:scale-[1.02] sm:w-auto"
                  >
                    Send an Enquiry
                  </a>
                  <a
                    href="#participation-modes"
                    className="inline-flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 px-8 py-2.5 text-[16px] font-bold text-white transition-transform hover:scale-[1.02] sm:w-auto"
                  >
                    Explore Modes
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {proofPoints.map((point) => (
                <article
                  key={point.title}
                  className="rounded-[10px] border border-white/20 bg-[#1b0d36] p-6 shadow-2xl"
                >
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                    Value Proposition
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    {point.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="participation-modes"
          className="border-t border-gray-100 bg-[#f7f4ef] py-section-md dark:border-gray-800 dark:bg-gray-900/30 md:py-section-lg"
        >
          <div className="container mx-auto max-w-[1300px] px-4 md:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="mb-2 text-body-xs font-semibold uppercase tracking-widest text-[#5c0f4f] dark:text-rc-secondary">
                Participation Modes
              </p>
              <h2 className="mb-5 text-display-lg font-black text-stone-900 dark:text-white">
                Choose the kind of presence that fits your story best
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {participationModes.map((mode, i) => (
                <article
                  key={i}
                  className="flex flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-stone-200/30 dark:border-stone-800 dark:bg-gray-900/50"
                >
                  <div className="aspect-[3/2] w-full overflow-hidden border-b border-stone-200 dark:border-stone-800">
                    <Image
                      src={mode.image}
                      alt={mode.title}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-7">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                      Mode 0{i + 1}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                      {mode.title}
                    </h3>
                    <p className="mt-4 flex-grow text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                      {mode.body}
                    </p>
                    <div className="mt-6 border-t border-stone-100 pt-4 dark:border-gray-800">
                      <p className="text-[12px] font-semibold text-rc-accent dark:text-rc-secondary">
                        Recommended Fit
                      </p>
                      <p className="mt-1 text-sm font-medium leading-snug text-stone-700 dark:text-stone-400">
                        {mode.fit}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-white py-section-md dark:border-gray-800 dark:bg-[#121212] md:py-section-lg">
          <div className="container mx-auto max-w-[1300px] px-4 md:px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-2 text-body-xs font-semibold uppercase tracking-widest text-[#5c0f4f] dark:text-rc-secondary">
                Extended Integrations
              </p>
              <h2 className="mb-5 text-display-lg font-black text-stone-900 dark:text-white">
                Festival-wide branding opportunities
              </h2>
              <p className="text-body-md leading-relaxed text-stone-700 dark:text-stone-300">
                Beyond physical structures and booths, your organization can
                embed itself directly into the delegate experience through
                critical event touchpoints.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {extendedBranding.map((item, i) => (
                <article
                  key={i}
                  className={`group relative flex flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-gray-50 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-gray-900/50 ${item.cardClassName ?? ''}`}
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-stone-200 bg-[#f7f4ef] dark:border-stone-800 dark:bg-gray-800/80">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${item.imageClassName ?? ''}`}
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-6">
                    <h3 className="mb-3 text-lg font-bold leading-tight text-stone-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-br from-[#350265] to-[#5c0f4f] px-4 py-section-md text-white md:px-6 md:py-section-lg">
          <div className="container mx-auto max-w-[1300px]">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-3xl font-black leading-[1.1] tracking-tight text-white md:text-4xl lg:text-[2.8rem]">
                  Visibility feels more valuable when the room is already
                  relevant.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                  TASI is not built around passive traffic. It is built around
                  organisations and individuals who already have a stake in
                  trust, safety, policy, and implementation.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: 'Access with context',
                    body: 'Conversations happen inside a shared frame, making presence feel instantly relevant.',
                  },
                  {
                    title: 'Design for follow-up',
                    body: 'Premium environments translate curiosity into better meetings and recall.',
                  },
                  {
                    title: 'Broad engagement',
                    body: 'Reach policymakers, trust & safety ops teams, researchers, and civil society.',
                  },
                  {
                    title: 'Credibility',
                    body: 'Being seen in the right room is as important as the number of people who walk past.',
                  },
                ].map((item, idx) => (
                  <article
                    key={idx}
                    className="rounded-[10px] border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
                  >
                    <h3 className="mb-2 text-[17px] font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/80">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="exhibition-enquiry"
          className="border-t border-stone-200 bg-[linear-gradient(180deg,#fcfaf6_0%,#f3ecdf_100%)] py-section-md dark:border-stone-800 dark:bg-[linear-gradient(180deg,#18121f_0%,#120f18_100%)] md:py-section-lg"
        >
          <div className="container mx-auto max-w-[1300px] px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              <div className="max-w-xl">
                <p className="text-body-xs font-semibold uppercase tracking-[0.18em] text-[#5c0f4f] dark:text-rc-secondary">
                  Exhibition Enquiry
                </p>
                <h2 className="mt-4 max-w-lg text-display-lg font-black tracking-tight text-stone-900 dark:text-white">
                  Start the conversation around a presence that belongs in the
                  room.
                </h2>
                <p className="mt-6 max-w-xl text-body-md leading-relaxed text-stone-700 dark:text-stone-300">
                  TASI exhibition participation is shaped for organisations that
                  want more than surface visibility. Share a few details about
                  your team, your intent, and the kind of presence you are
                  considering, and we will guide the conversation toward the
                  format that fits best.
                </p>

                <p className="mt-6 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  Prefer to reach out directly? Write to{' '}
                  <a
                    href="mailto:info1@csrindia.org"
                    className="font-semibold text-[#5c0f4f] underline underline-offset-4 dark:text-rc-secondary"
                  >
                    info1@csrindia.org
                  </a>{' '}
                  and the team will route your enquiry with the same context.
                </p>
              </div>
              <div className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.18)] dark:border-stone-800 dark:bg-stone-950/80 md:p-8">
                <ExhibitionEnquiryForm />
              </div>
            </div>
          </div>
        </section>

        <GlobalCta />
      </main>
    </>
  );
}
