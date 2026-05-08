import Link from 'next/link';

import { PricingSection } from '@/components/ui/pricing';
import {
  sponsorMetrics,
  sponsorPartnerOptions,
  sponsorPricingPlans,
  sponsorReasons,
  sponsorshipPillars,
  sponsorshipProspectus,
} from '@/data/sponsor-page';

export function SponsorStorySection() {
  return (
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
            present in the right rooms, attached to the right conversations, and
            remembered for more than branding alone.
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
            Sponsors gain a platform to contribute to high-trust conversations,
            connect with decision-makers across sectors, and show visible
            commitment to safer digital ecosystems.
          </p>
          <div className="mt-8 space-y-3">
            {sponsorshipPillars.map((item) => (
              <div
                key={item}
                className="rounded-[10px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <p className="text-sm leading-relaxed text-white/88">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export function SponsorAdvantagesSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#1a042b_0%,#2d0641_52%,#4f0d53_100%)] py-12 text-white md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
            Sponsor Advantages
          </p>
          <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight md:text-5xl">
            One cohesive value proposition across visibility, voice, and access
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
            From policy visibility and thought leadership to strategic
            relationship-building, these advantages are designed to help
            sponsors show up with credibility and lasting relevance.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {sponsorReasons.map((reason, index) => (
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
  );
}

export function SponsorshipTiersSection() {
  return (
    <section
      id="sponsorship-tiers"
      className="bg-white py-12 dark:bg-stone-950 md:py-20"
    >
      <div className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 md:px-6">
        <div className="mt-10">
          <PricingSection
            plans={sponsorPricingPlans}
            heading="Sponsorship tiers with one cohesive system"
            description="Choose the level of presence, programming, and relationship-building that fits your goals at TASI 2026."
            columnsClassName="md:grid-cols-2 xl:grid-cols-3"
          />
        </div>
      </div>
    </section>
  );
}

export function SponsorPartnerOptionsSection() {
  return (
    <section
      id="partner-options"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3ece4_100%)] pb-12 pt-0 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:pb-20 md:pt-0"
    >
      <div className="mx-auto grid w-full max-w-6xl scroll-mt-24 gap-6 px-4 md:px-6 lg:grid-cols-2">
        <article className="rounded-[10px] border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf5_60%,#ffffff_100%)] p-6 dark:border-slate-700 dark:bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf5_60%,#ffffff_100%)] md:p-8 lg:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:!text-orange-700">
                Prospectus
              </p>
              <p className="mt-3 text-base leading-relaxed text-stone-700 dark:!text-stone-700 md:text-lg">
                {sponsorshipProspectus.description}
              </p>
            </div>
            <a
              href={sponsorshipProspectus.href}
              download
              className="inline-flex items-center justify-center rounded-full !bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] !text-[#140f26] transition hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26] dark:hover:!bg-white/90"
            >
              {sponsorshipProspectus.label}
            </a>
          </div>
        </article>

        {sponsorPartnerOptions.map((item) => (
          <article
            key={item.title}
            className="flex h-full flex-col rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#6a115e_58%,#ef5700_100%)] p-6 text-white shadow-[0_28px_80px_-42px_rgba(53,2,101,0.58)] md:p-8"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
              {item.eyebrow}
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
              {item.title}
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/82 md:text-base">
              {item.body}
            </p>
            <div className="mt-auto pt-8">
              <div className="flex flex-col gap-3">
                {item.email ? (
                  <a
                    href={`mailto:${item.email}`}
                    className="inline-flex items-center justify-center rounded-full !bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] !text-[#140f26] transition hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26]"
                  >
                    {item.email}
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
  );
}
