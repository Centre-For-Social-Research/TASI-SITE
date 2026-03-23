import Image from "next/image";
import Link from "next/link";

import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import BrandedPageHero from "@/components/ui/branded-page-hero";

const involvementOptions = [
  {
    title: "Become a Sponsor",
    description:
      "Put your organisation in front of policymakers, platform teams, researchers, and civil society leaders through tailored TASI partnership opportunities.",
    href: "/sponsor",
    cta: "Explore Sponsorships",
    image: "/img/home-gallery/tasi-2026-brochure-3.png",
    imageAlt: "TASI sponsorship brochure material",
    eyebrow: "Partnership",
  },
  {
    title: "Showcase Your Organisation",
    description:
      "Present your trust and safety work, initiatives, or tools through brand visibility, partner activations, and aligned festival touchpoints.",
    href: "/sponsor",
    cta: "See Brand Opportunities",
    image: "/img/home-gallery/highlight-2.webp",
    imageAlt: "TASI event space and showcase area",
    eyebrow: "Visibility",
  },
  {
    title: "Host a Partner Event",
    description:
      "Run a side conversation, partner roundtable, workshop, or hosted gathering around the festival with support from the TASI team.",
    href: "/contact",
    cta: "Plan a Partner Event",
    image: "/img/home-gallery/tasi-community-mixer.webp",
    imageAlt: "Networking and partner gathering at TASI",
    eyebrow: "Convening",
  },
  {
    title: "Attend as Press",
    description:
      "Apply for media accreditation to cover TASI, receive updates from the team, and access festival resources for newsroom planning.",
    href: "/media#media-accreditation",
    cta: "Get Media Access",
    image: "/img/home-gallery/7T7A9837.webp",
    imageAlt: "Press and audience coverage at TASI",
    eyebrow: "Media",
  },
  {
    title: "Become a Media or Association Partner",
    description:
      "Collaborate with TASI as a media platform, association, or ecosystem organisation to amplify key conversations and reach relevant communities.",
    href: "/media",
    cta: "View Media Page",
    image: "/img/home-gallery/IMG_6646.webp",
    imageAlt: "Audience and conference engagement at TASI",
    eyebrow: "Amplification",
  },
  {
    title: "Join as an Ecosystem Partner",
    description:
      "Work with TASI as a mission-aligned institution, network, academic body, or civil society organisation shaping safer digital futures.",
    href: "/contact",
    cta: "Discuss Collaboration",
    image: "/img/home-gallery/7T7A9974.webp",
    imageAlt: "Delegates in conversation at a TASI gathering",
    eyebrow: "Community",
  },
  {
    title: "Speak at TASI",
    description:
      "Share research, field experience, product insight, or policy thinking on stage with a cross-sector trust and safety audience.",
    href: "/speaker-application",
    cta: "Apply to Speak",
    image: "/img/home-gallery/IMG_7326.webp",
    imageAlt: "Speaker session at TASI",
    eyebrow: "Thought Leadership",
  },
  {
    title: "Join as a Volunteer",
    description:
      "Support delegates, speakers, and on-site operations while gaining hands-on experience inside the festival environment.",
    href: "/volunteer-application",
    cta: "Apply as Volunteer",
    image: "/img/volunteers/volunteer-checkin.webp",
    imageAlt: "Volunteer team handling attendee arrivals at TASI",
    eyebrow: "Volunteer",
  },
  {
    title: "Plan a Side Meeting or Venue",
    description:
      "Coordinate client meetings, private conversations, or adjacent gathering space around the festival dates with help from the organising team.",
    href: "/contact",
    cta: "Contact the Team",
    image: "/img/home-gallery/7T7A5650.webp",
    imageAlt: "Delegates meeting during the festival",
    eyebrow: "Meetings",
  },
  {
    title: "Plan Your Stay in New Delhi",
    description:
      "We can help point delegates, speakers, and partners toward practical planning guidance for travel, timing, and staying close to the festival.",
    image: "/img/home-gallery/7T7A9399.webp",
    imageAlt: "Delegates arriving for TASI",
    eyebrow: "Travel",
    note: "Travel guidance available on request",
  },
  {
    title: "Build a Custom Delegation Experience",
    description:
      "Bring a team, partner cohort, or curated delegation and work with us on meetings, introductions, and a higher-value TASI experience.",
    href: "/contact",
    cta: "Design a Delegation Plan",
    image: "/img/home-gallery/highlight-6.webp",
    imageAlt: "Curated delegation activity at TASI",
    eyebrow: "Delegations",
  },
];

const quickLinks = [
  { label: "Register", href: "/register" },
  { label: "Programme", href: "/programme" },
  { label: "Media", href: "/media" },
  { label: "Volunteer", href: "/volunteer-application" },
];

export const metadata = {
  title: "Get Involved at TASI 2026",
  description:
    "Discover the ways to participate in TASI 2026, from sponsoring and speaking to media participation, partnerships, and curated delegate experiences.",
};

function InvolvementCard({ item }) {
  const content = (
    <>
      <div className="relative aspect-[1.42/1] overflow-hidden rounded-[10px]">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 25vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 text-center">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-orange-700">{item.eyebrow}</p>
        <h3 className="mt-2 text-[1.02rem] font-black tracking-tight text-stone-950">{item.title}</h3>
        <p className="mt-3 text-[13px] leading-6 text-stone-600">{item.description}</p>
        <div className="mt-4">
          {item.href ? (
            <span className="inline-flex items-center rounded-[10px] border border-stone-300 bg-stone-50 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-stone-900 transition group-hover:border-stone-500 group-hover:bg-white">
              {item.cta}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-[10px] border border-orange-200 bg-orange-50 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-orange-800">
              {item.note}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="group flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-3 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.26)]"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-3 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.22)]">
      {content}
    </article>
  );
}

export default function GetInvolvedPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] pb-20 text-stone-900">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Get Involved</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Find your way into TASI 2026
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              From sponsorships and speaking opportunities to media access, partner events, and delegation planning,
              there are multiple ways to take part in India&apos;s leading trust and safety convening.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/15"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-10 max-w-7xl px-6 sm:px-8">
          <div className="px-2 py-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Participation Paths</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
              How will you shape your impact at TASI?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-stone-600 md:text-base">
              From speaking and sponsorship to media access, delegations, and partner-led moments, we&apos;ll help you
              find the format that best fits your goals.
            </p>

            <div className="mt-10 grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
              {involvementOptions.map((item) => (
                <InvolvementCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[10px] border border-stone-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Best Fits</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                Built for cross-sector participation, not one narrow audience
              </h2>
              <div className="mt-6 grid gap-3">
                {[
                  "Policy leaders and regulators looking to engage with platform and civil society perspectives",
                  "Trust and safety teams wanting visibility, partnerships, or speaking opportunities",
                  "Journalists and editors preparing coverage around digital trust, online harms, and platform accountability",
                  "Associations, academic bodies, and nonprofits looking to convene the right people in one place",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-relaxed text-stone-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-stone-200 bg-[linear-gradient(145deg,#111827,#1f2937,#7c2d12)] px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">Need Something Specific?</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                We can shape a more tailored way to participate
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                If your team is exploring a delegation, a partner activation, a hosted roundtable, a research launch,
                or a media collaboration, we can help route you to the right format quickly.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-[10px] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-stone-950 transition hover:bg-white/90"
                >
                  Contact TASI
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-[10px] border border-white/20 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/15"
                >
                  Register as Delegate
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <HomeFooter />
    </>
  );
}
