import Link from "next/link";
import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import PartnersMarqueeStrip from "@/components/sponsor/partners-marquee-strip";

const sponsorMetrics = [
  {
    value: "1,000+",
    label: "Policymakers, platform leaders, and civil society participants in the room",
  },
  {
    value: "2 Days",
    label: "Of sustained visibility across sessions, networking, and curated side moments",
  },
  {
    value: "Cross-Sector",
    label: "A sponsor audience spanning policy, safety operations, academia, and advocacy",
  },
];

const reasons = [
  {
    title: "Influence the right conversations",
    body: "Direct engagement with policymakers, trust and safety leaders, and civil society representatives working on digital governance and online safety.",
  },
  {
    title: "Earn meaningful visibility",
    body: "Brand presence across sessions, venue touchpoints, delegate materials, and digital channels without feeling disconnected from the programme.",
  },
  {
    title: "Show up with substance",
    body: "Opportunities for speaking, workshops, spotlight moments, and thematic alignment that go beyond logo placement.",
  },
  {
    title: "Reach a globally relevant audience",
    body: "TASI is rooted in India while connecting to broader cross-border debates around AI, platform accountability, and digital trust.",
  },
];

const sponsorshipPillars = [
  "Thought leadership through sessions, spotlights, and workshops",
  "Brand visibility integrated across physical and digital touchpoints",
  "Relationship-building with a high-intent, cross-sector participant base",
];

const tiers = [
  {
    name: "Platinum Partner",
    price: "$30,000",
    availability: "1 Platinum Sponsorship available",
    emphasis: true,
    cta: "Request Platinum Brochure",
    summary: "The headline partnership for organizations that want the broadest presence across content, convening, and visibility.",
    features: [
      "Keynote slot (20 min) or 60-min session / 45-min panel with experts",
      "Collaboration on shaping a key session theme or emerging issue",
      "Website, badges, on-site collateral, and social media branding",
      "Exhibit booth to showcase trust and safety efforts",
      "Up to 10 tickets for staff to attend both days",
    ],
  },
  {
    name: "Gold Partner",
    price: "$20,000",
    availability: "3 available",
    cta: "Enquire Now",
    summary: "A strong lead package for organizations seeking visible participation and a substantive speaking presence.",
    features: [
      "60-min session or 45-min panel",
      "Website, badges, on-site presence, and social media branding",
      "Exhibit booth",
      "Up to 5 tickets",
    ],
  },
  {
    name: "Silver Partner",
    price: "$10,000",
    availability: "5 available",
    cta: "Enquire Now",
    summary: "A focused sponsorship for organizations that want visibility, content contribution, and a lighter footprint.",
    features: [
      "60-min session or 45-min panel",
      "Website, on-site presence, and social media branding",
      "Up to 2 tickets",
    ],
  },
  {
    name: "Spotlight Partner",
    price: "$5,000",
    availability: "Limited slots",
    cta: "Enquire Now",
    summary: "Best for concise high-impact visibility with a short main-stage presence.",
    features: [
      "10-min main stage spotlight",
      "Website, session logo, and social media branding",
      "2 tickets",
    ],
  },
  {
    name: "Workshop Partner",
    price: "$5,000",
    availability: "Limited slots",
    cta: "Enquire Now",
    summary: "Ideal for organizations wanting a practical, interactive format with attendees.",
    features: [
      "1-2 hour interactive workshop",
      "Website and agenda listing",
      "2 tickets",
    ],
  },
];

const additionalOpportunities = [
  "Host a reception for guests at a nearby or mutually agreed location.",
  "Create a custom partnership aligned with Trust and Safety Festival programming.",
  "Access discounted options for women-led businesses supporting diverse leadership.",
];

export default function SponsorPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-10 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Partner With TASI 2026</p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-6xl">Sponsorship Opportunities</h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Align with a high-level policy forum shaping trust and safety outcomes in India and globally.
            </p>
          </div>
        </BrandedPageHero>

        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf2_0%,#f7ede0_100%)] py-12 md:py-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,217,25,0.28),transparent_62%)]" />
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent">Why Sponsor TASI</p>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight text-stone-900 md:text-5xl">
                A cleaner, stronger sponsorship story built around access and credibility
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-700 md:text-lg">
                TASI sponsorships are designed for organizations that want to be present in the right rooms, attached to the right conversations, and remembered for more than branding alone.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {sponsorMetrics.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-3xl border border-stone-200/80 bg-white/90 p-5 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.4)]"
                  >
                    <p className="text-2xl font-black tracking-tight text-rc-primary md:text-3xl">{item.value}</p>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.label}</p>
                  </article>
                ))}
              </div>
            </div>

            <article className="rounded-[2rem] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_48%,#15002b_100%)] p-7 text-white shadow-[0_30px_80px_-34px_rgba(53,2,101,0.55)] md:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary">What sponsors get</p>
              <h3 className="mt-4 text-3xl font-black tracking-tight md:text-[2.15rem]">Presence that feels integrated, not decorative</h3>
              <p className="mt-5 text-base leading-relaxed text-white/82">
                The page now mirrors the TASI theme more closely because the sponsorship offer itself should feel as considered as the event brand.
              </p>
              <div className="mt-8 space-y-3">
                {sponsorshipPillars.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-white/88">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#1a042b_0%,#2d0641_52%,#4f0d53_100%)] py-12 text-white md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary">Sponsor Advantages</p>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight md:text-5xl">
                One cohesive value proposition across visibility, voice, and access
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
                Rather than listing disconnected benefits, the page now frames sponsorship around the outcomes organizations actually care about.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {reasons.map((reason, index) => (
                <article
                  key={reason.title}
                  className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-sm md:p-7"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary">
                    Benefit {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{reason.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/78 md:text-base">{reason.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Packages</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Sponsorship tiers with one cohesive system</h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-700 md:text-base">
                Each tier is structured for easier comparison while keeping the premium package clearly elevated.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf5_60%,#ffffff_100%)] p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Prospectus</p>
                  <p className="mt-3 text-base leading-relaxed text-stone-700 md:text-lg">
                    Download the sponsorship prospectus for package details, benefits, deliverables, and engagement options.
                  </p>
                </div>
                <a
                  href="/downloads/tasi-2026-sponsorship-prospectus.txt"
                  download
                  className="inline-flex items-center justify-center rounded-full bg-orange-700 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-800"
                >
                  Download Prospectus
                </a>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
              {tiers.map((tier) => (
                <article
                  key={tier.name}
                  className={[
                    "rounded-[28px] border p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.24)]",
                    tier.emphasis
                      ? "border-orange-300 bg-[linear-gradient(135deg,#fff2e2_0%,#fff8f0_45%,#ffffff_100%)] md:col-span-2 xl:col-span-6"
                      : "border-stone-200 bg-[linear-gradient(180deg,#fcfbf8_0%,#ffffff_100%)] xl:col-span-3",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <p className={`mb-3 text-xs font-black uppercase tracking-[0.18em] ${tier.emphasis ? "text-orange-700" : "text-stone-500"}`}>
                        {tier.availability}
                      </p>
                      <h3 className={`text-2xl font-black tracking-tight md:text-3xl ${tier.emphasis ? "text-orange-700" : "text-stone-900"}`}>
                        {tier.name}
                      </h3>
                      <p className="mt-3 text-3xl font-black text-orange-700 md:text-4xl">{tier.price}</p>
                    </div>
                    <a
                      className={[
                        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] transition",
                        tier.emphasis
                          ? "bg-orange-700 text-white hover:bg-orange-800"
                          : "border border-stone-300 text-stone-800 hover:border-stone-500",
                      ].join(" ")}
                      href="mailto:india@trustandsafetyfestival.org"
                    >
                      {tier.cta}
                    </a>
                  </div>

                  <ul className={`mt-6 grid gap-3 text-sm text-stone-700 ${tier.emphasis ? "md:grid-cols-2" : ""}`}>
                    {tier.features.map((feature) => (
                      <li key={feature} className="rounded-2xl border border-stone-200/70 bg-white/90 px-4 py-4 leading-relaxed">
                        {feature}
                      </li>
                    ))}
                    <li
                      className={[
                        "rounded-2xl px-4 py-4 font-semibold",
                        tier.emphasis ? "bg-orange-100 text-orange-800" : "border border-dashed border-stone-300 bg-white text-stone-700",
                      ].join(" ")}
                    >
                      Availability: {tier.availability}
                    </li>
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3ece4_100%)] py-12 md:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:px-6 lg:grid-cols-2">
            <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Flexible Partnerships</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-stone-900 md:text-3xl">Additional sponsorship opportunities</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-700 md:text-base">
                {additionalOpportunities.map((item) => (
                  <li key={item} className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="flex h-full flex-col rounded-[28px] bg-[linear-gradient(135deg,#350265_0%,#6a115e_58%,#ef5700_100%)] p-6 text-white shadow-[0_28px_80px_-42px_rgba(53,2,101,0.58)] md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary">Custom Partnership</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">Need something more tailored?</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/82 md:text-base">
                If you want a bespoke package, hosted side event, or a partnership aligned to a specific audience segment, we can shape that with you directly.
              </p>
              <div className="mt-auto pt-8">
                <div className="flex flex-col gap-3">
                  <a
                    href="mailto:india@trustandsafetyfestival.org"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-rc-primary transition hover:opacity-90"
                  >
                    india@trustandsafetyfestival.org
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-rc-primary"
                  >
                    View Contact Page
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>

        <PartnersMarqueeStrip />
      </main>
      <HomeFooter />
    </>
  );
}
