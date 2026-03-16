import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";

const reasons = [
  "Direct engagement with 1,000+ policymakers, tech leaders, and civil society representatives.",
  "Global visibility across a cross-border trust and safety dialogue.",
  "Access to influential speakers shaping policy and operational standards.",
  "Visibility across panels, fireside chats, workshops, and spotlight sessions.",
  "Strategic networking with leadership receptions and curated meetups.",
  "High-impact branding across venue, digital channels, and event collateral.",
];

const tiers = [
  {
    name: "Platinum Partner",
    price: "$30,000",
    availability: "1 Platinum Sponsorship available",
    emphasis: true,
    cta: "Request Platinum Brochure",
    features: [
      "Speaking: Keynote slot (20 min) or 60-min session / 45-min panel with experts",
      "Visibility: Collaborate on shaping a key session theme or emerging issue",
      "Branding: Website, badges, on-site collateral, social media",
      "Booth: Exhibit booth to showcase trust and safety efforts",
      "Passes: Up to 10 tickets for staff to attend both days",
    ],
  },
  {
    name: "Gold Partner",
    price: "$20,000",
    availability: "3 available",
    cta: "Enquire Now",
    features: [
      "Speaking: 60-min session or 45-min panel",
      "Branding: Website, badges, on-site presence and social media",
      "Booth: Exhibit booth",
      "Passes: Up to 5 tickets",
    ],
  },
  {
    name: "Silver Partner",
    price: "$10,000",
    availability: "5 available",
    cta: "Enquire Now",
    features: [
      "Speaking: 60-min session or 45-min panel",
      "Branding: Website, on-site presence and social media",
      "Passes: Up to 2 tickets",
    ],
  },
  {
    name: "Spotlight Partner",
    price: "$5,000",
    availability: "Limited slots",
    cta: "Enquire Now",
    features: [
      "Speaking: 10-min main stage spotlight",
      "Branding: Website, session logo and social media",
      "Passes: 2 tickets",
    ],
  },
  {
    name: "Workshop Partner",
    price: "$5,000",
    availability: "Limited slots",
    cta: "Enquire Now",
    features: [
      "Speaking: 1-2 hour interactive workshop",
      "Branding: Website and agenda listing",
      "Passes: 2 tickets",
    ],
  },
];

const additionalOpportunities = [
  "Host a reception for guests at a nearby or mutually agreed location.",
  "Create a custom partnership aligned with Trust and Safety Festival programming.",
  "Access discounted options for women-led businesses supporting diverse leadership.",
];

const partners = [
  { name: "Booking.com", logo: "/img/Logo/Booking.com.png" },
  { name: "Teleperformance", logo: "/img/Logo/TP.jpg" },
  { name: "Meta", logo: "/img/Logo/Meta.png" },
  { name: "Snapchat", logo: "/img/Logo/Snapchat.png" },
  { name: "YouTube", logo: "/img/Logo/YouTube.png" },
  { name: "Truecaller", logo: "/img/Logo/Truecaller.png" },
  { name: "GSMA", logo: "/img/Logo/GSMA.png" },
  { name: "Match Group", logo: "/img/Logo/Match Group.png" },
  { name: "X", logo: "/img/Logo/X.png" },
  { name: "Resolver", logo: "/img/Logo/Resolver.png" },
  { name: "VYS", logo: "/img/Logo/VYS.png" },
  { name: "GirlEffect", logo: "/img/Logo/GirlEffect.jpg" },
  { name: "UN Women", logo: "/img/Logo/Un Women.png" },
  { name: "French Embassy", logo: "/img/Logo/France in India.png" },
  { name: "Swedish Embassy", logo: "/img/Logo/Sweden Embassy.png" },
  { name: "Australian High Commission", logo: "/img/Logo/Australian High Commission.png" },
  { name: "Netherlands Embassy", logo: "/img/Logo/kingdom-of-the-netherlands.png" },
  { name: "Canadian High Commission", logo: "/img/Logo/Embassy of Canada.png" },
  { name: "Obhan & Associates", logo: "/img/Logo/Obhan and Associates.png" },
  { name: "ASCI", logo: "/img/Logo/ASCI.png" },
  { name: "Dhirubhai Ambani University", logo: "/img/Logo/Dhirubhai Ambani University.jpg" },
  { name: "The Asia Foundation", logo: "/img/Logo/The Asia Foundation.png" },
  { name: "ACTS", logo: "/img/Logo/ACTS.png" },
  { name: "Safetipin", logo: "/img/Logo/Safetipin.png" },
  { name: "The Dialogue", logo: "/img/Logo/The Dialogue.png" },
  { name: "IGPP", logo: "/img/Logo/IGPP.png" },
  { name: "INHOPE", logo: "/img/Logo/Inhope.png" },
  { name: "TQH", logo: "/img/Logo/TQH.png" },
  { name: "COR Sandbox", logo: "/img/Logo/COR Sandbox.jpg" },
  { name: "Roblox", logo: "/img/Logo/Roblox.png" },
  { name: "GroSafe", logo: "/img/Logo/GroSafe.png" },
  { name: "FRIDA Fund", logo: "/img/Logo/FRIDA Logo.png" },
];

export default function SponsorPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-10 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)] md:py-20">
          <DarkHeroParticles />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-300">Partner With TASI 2026</p>
            <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-slate-100 md:text-6xl">Sponsorship Opportunities</h1>
            <p className="mx-auto mt-4 max-w-3xl text-stone-700 dark:text-slate-200">
              Align with a high-level policy forum shaping trust and safety outcomes in India and globally.
            </p>
          </div>
        </section>

        <section className="bg-stone-100 py-10 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-stone-900 md:mb-8 md:text-5xl">Why Sponsor TASI 2026?</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reasons.map((reason) => (
                <article key={reason} className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700 md:p-5 md:text-base">
                  {reason}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-10 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-stone-900 md:mb-8 md:text-5xl">Sponsorship Tiers</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {tiers.map((tier) => (
                <article
                  key={tier.name}
                  className={[
                    "rounded-2xl border p-4 md:p-5",
                    tier.emphasis
                      ? "border-orange-300 bg-gradient-to-br from-orange-50 to-white md:col-span-2 xl:col-span-6"
                      : "border-stone-200 bg-stone-50 xl:col-span-3",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className={`mb-2 text-lg font-bold md:text-xl ${tier.emphasis ? "text-orange-700" : "text-stone-900"}`}>
                        {tier.name}
                      </h3>
                      <p className="mb-2 text-2xl font-black text-orange-700 md:text-3xl">{tier.price}</p>
                    </div>
                    <a
                      className={[
                        "rounded-md px-4 py-2 text-sm font-semibold transition",
                        tier.emphasis
                          ? "bg-orange-700 text-white hover:bg-orange-800"
                          : "border border-stone-300 text-stone-800 hover:border-stone-500",
                      ].join(" ")}
                      href="mailto:india@trustandsafetyfestival.org"
                    >
                      {tier.cta}
                    </a>
                  </div>

                  <ul className={`mt-5 grid gap-3 text-sm text-stone-700 ${tier.emphasis ? "md:grid-cols-2" : ""}`}>
                    {tier.features.map((feature) => (
                      <li key={feature} className="rounded-xl bg-white/80 px-4 py-3">
                        {feature}
                      </li>
                    ))}
                    <li
                      className={[
                        "rounded-xl px-4 py-3 font-semibold",
                        tier.emphasis ? "bg-orange-100 text-orange-800" : "bg-white text-stone-700",
                      ].join(" ")}
                    >
                      Availability: {tier.availability}
                    </li>
                  </ul>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-stone-200 bg-stone-50 p-4 md:p-6">
              <h3 className="text-center text-xl font-bold tracking-tight text-stone-900 md:text-2xl">Additional Sponsorship Opportunities</h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-stone-700">
                {additionalOpportunities.map((item) => (
                  <li key={item} className="rounded-xl bg-white px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-center text-stone-700">
              For details and customization: <a className="font-semibold text-orange-700" href="mailto:india@trustandsafetyfestival.org">india@trustandsafetyfestival.org</a>
            </p>
          </div>
        </section>

        <section className="bg-stone-100 py-10 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Our Network</p>
            <h2 className="mb-6 text-2xl font-black tracking-tight text-stone-900 md:mb-8 md:text-5xl">Partners from TASI 2025</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {partners.map((partner) => (
                <article
                  key={partner.name}
                  className="flex min-h-16 items-center justify-center rounded-lg border border-stone-200 bg-white px-2 py-2 sm:min-h-24 sm:rounded-xl sm:px-4 sm:py-3"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    loading="lazy"
                    className="h-9 w-full object-contain sm:h-12"
                  />
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
