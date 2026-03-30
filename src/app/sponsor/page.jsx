import Link from 'next/link';
import HomeFooter from '@/components/home/footer';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { PricingSection } from '@/components/ui/pricing';
import PartnersMarqueeStrip from '@/components/sponsor/partners-marquee-strip';

const sponsorMetrics = [
  {
    value: '1,000+',
    label:
      'Policymakers, platform leaders, and civil society participants in the room',
  },
  {
    value: '2 Days',
    label:
      'Of sustained visibility across sessions, networking, and curated side moments',
  },
  {
    value: 'Cross-Sector',
    label:
      'A sponsor audience spanning policy, safety operations, academia, and advocacy',
  },
];

const reasons = [
  {
    title: 'Influence the right conversations',
    body: 'Direct engagement with policymakers, trust and safety leaders, and civil society representatives working on digital governance and online safety.',
  },
  {
    title: 'Earn meaningful visibility',
    body: 'Brand presence across sessions, venue touchpoints, delegate materials, and digital channels without feeling disconnected from the programme.',
  },
  {
    title: 'Show up with substance',
    body: 'Opportunities for speaking, workshops, spotlight moments, and thematic alignment that go beyond logo placement.',
  },
  {
    title: 'Reach a globally relevant audience',
    body: 'TASI is rooted in India while connecting to broader cross-border debates around AI, platform accountability, and digital trust.',
  },
];

const sponsorshipPillars = [
  'Thought leadership through sessions, spotlights, and workshops',
  'Brand visibility integrated across physical and digital touchpoints',
  'Relationship-building with a high-intent, cross-sector participant base',
];

const tiers = [
  {
    name: 'Platinum',
    price: '$30,000',
    availability: 'Exclusive',
    emphasis: true,
    cta: 'Enquire Now',
    info: 'All Access Leadership',
    features: [
      'Keynote + panel + spotlight + workshop',
      'Strategic co-creation of a flagship theme',
      'Premium visibility across festival touchpoints plus exhibit booth',
      '10 passes',
    ],
  },
  {
    name: 'Gold',
    price: '$20,000',
    availability: '3 available',
    cta: 'Enquire Now',
    info: 'Lead a Key Conversation',
    features: [
      'Panel + one activation of your choice',
      'Choose either a spotlight or workshop',
      'Full visibility across channels plus exhibit booth',
      '5 passes',
    ],
  },
  {
    name: 'Silver',
    price: '$10,000',
    availability: '5 available',
    cta: 'Enquire Now',
    info: 'Contribute to the Dialogue',
    features: [
      'Panel participation',
      'Core visibility',
      '2 passes',
      'Optional add-ons: spotlight ($5K) or workshop ($5K)',
    ],
  },
  {
    name: 'Supporter',
    price: '$5,000',
    availability: 'Limited slots',
    cta: 'Enquire Now',
    info: 'Showcase Your Work',
    features: [
      'Choose one: spotlight talk (10 min), interactive workshop (1-2 hrs), or keynote speaker slot (10 min)',
      'Includes branding',
      '2 passes',
    ],
  },
];

const pricingPlans = [
  ...tiers.map((tier) => ({
    name: tier.name,
    info: tier.info,
    price: tier.price,
    availability: tier.availability,
    highlighted: tier.emphasis,
    features: tier.features.map((feature) => ({ text: feature })),
    btn: {
      text: tier.cta,
      href: 'mailto:india@trustandsafetyfestival.org',
    },
  })),
  {
    name: 'Add-On Opportunities',
    info: 'Extend your partnership',
    availability: 'Callout Box',
    badge: 'Flexible',
    features: [
      { text: 'Support Global South participation - $2,500 per expert' },
      { text: 'Host a networking reception' },
      { text: 'Custom partnerships available' },
    ],
  },
];

const partnerOptions = [
  {
    title: 'Media or Association Partner',
    body: 'Collaborate with TASI as a media platform, trade body, association, or ecosystem network to amplify key conversations and reach the communities that matter most.',
    href: '/media',
    cta: 'Enquire Now',
  },
  {
    title: 'Custom Partnership',
    body: 'If you want a bespoke package, hosted side event, or a partnership aligned to a specific audience segment, we can shape that with you directly.',
    href: '/contact',
    cta: 'View Contact Page',
  },
];

export default function SponsorPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-10 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Partner With TASI 2026
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-6xl">
              Sponsorship Opportunities
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Align with a high-level policy forum shaping trust and safety
              outcomes in India and globally.
            </p>
          </div>
        </BrandedPageHero>

        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf2_0%,#f7ede0_100%)] py-12 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,217,25,0.28),transparent_62%)]" />
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
                Why Sponsor TASI
              </p>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight text-stone-900 dark:text-white md:text-5xl">
                A cleaner, stronger sponsorship story built around access and
                credibility
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-700 dark:text-slate-300 md:text-lg">
                TASI sponsorships are designed for organizations that want to be
                present in the right rooms, attached to the right conversations,
                and remembered for more than branding alone.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {sponsorMetrics.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[10px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.4)] dark:border-slate-800 dark:bg-slate-900/90"
                  >
                    <p className="text-2xl font-black tracking-tight text-rc-primary dark:text-white md:text-3xl">
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                      {item.label}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <article className="rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_48%,#15002b_100%)] p-7 text-white shadow-[0_30px_80px_-34px_rgba(53,2,101,0.55)] md:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
                What sponsors get
              </p>
              <h3 className="mt-4 text-3xl font-black tracking-tight md:text-[2.15rem]">
                Presence that feels integrated, not decorative
              </h3>
              <p className="mt-5 text-base leading-relaxed text-white/82">
                Sponsors gain a platform to contribute to high-trust
                conversations, connect with decision-makers across sectors, and
                show visible commitment to safer digital ecosystems.
              </p>
              <div className="mt-8 space-y-3">
                {sponsorshipPillars.map((item) => (
                  <div
                    key={item}
                    className="rounded-[10px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm"
                  >
                    <p className="text-sm leading-relaxed text-white/88">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#1a042b_0%,#2d0641_52%,#4f0d53_100%)] py-12 text-white md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
                Sponsor Advantages
              </p>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight md:text-5xl">
                One cohesive value proposition across visibility, voice, and
                access
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
                From policy visibility and thought leadership to strategic
                relationship-building, these advantages are designed to help
                sponsors show up with credibility and lasting relevance.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {reasons.map((reason, index) => (
                <article
                  key={reason.title}
                  className="rounded-[10px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-sm md:p-7"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
                    Benefit {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-2xl font-black tracking-tight text-white">
                    {reason.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/78 md:text-base">
                    {reason.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="sponsorship-tiers"
          className="bg-white py-12 dark:bg-stone-950 md:py-20"
        >
          <div className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 md:px-6">
            <div className="mt-10">
              <PricingSection
                plans={pricingPlans}
                heading="Sponsorship tiers with one cohesive system"
                description="Choose the level of presence, programming, and relationship-building that fits your goals at TASI 2026."
                columnsClassName="md:grid-cols-2 xl:grid-cols-3"
              />
            </div>
          </div>
        </section>

        <section
          id="partner-options"
          className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3ece4_100%)] pb-12 pt-0 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:pb-20 md:pt-0"
        >
          <div className="mx-auto grid w-full max-w-6xl scroll-mt-24 gap-6 px-4 md:px-6 lg:grid-cols-2">
            <article className="lg:col-span-2 rounded-[10px] border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf5_60%,#ffffff_100%)] p-6 dark:border-slate-700 dark:bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf5_60%,#ffffff_100%)] md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:!text-orange-700">
                    Prospectus
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-stone-700 dark:!text-stone-700 md:text-lg">
                    Download the sponsorship prospectus for package details,
                    benefits, deliverables, and engagement options.
                  </p>
                </div>
                <a
                  href="/downloads/tasi-2026-sponsorship-prospectus.txt"
                  download
                  className="inline-flex items-center justify-center rounded-full !bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] !text-[#140f26] transition hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26] dark:hover:!bg-white/90"
                >
                  Download Prospectus
                </a>
              </div>
            </article>

            {partnerOptions.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#6a115e_58%,#ef5700_100%)] p-6 text-white shadow-[0_28px_80px_-42px_rgba(53,2,101,0.58)] md:p-8"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
                  {item.title === 'Media or Association Partner'
                    ? 'Amplification'
                    : 'Custom Partnership'}
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/82 md:text-base">
                  {item.body}
                </p>
                <div className="mt-auto pt-8">
                  <div className="flex flex-col gap-3">
                    {item.title === 'Custom Partnership' ? (
                      <a
                        href="mailto:india@trustandsafetyfestival.org"
                        className="inline-flex items-center justify-center rounded-full !bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] !text-[#140f26] transition hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26]"
                      >
                        india@trustandsafetyfestival.org
                      </a>
                    ) : null}
                    <Link
                      href={item.href}
                      className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:!bg-white hover:!text-[#140f26] dark:hover:!bg-white dark:hover:!text-[#140f26]"
                    >
                      {item.cta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <PartnersMarqueeStrip />
      </main>
      <HomeFooter />
    </>
  );
}
