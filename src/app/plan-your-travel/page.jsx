import Link from "next/link";
import { Globe, Plane, Shield, Hotel, ArrowRight, Clock, Banknote, Zap, Phone } from "lucide-react";
import TravelShell from "@/components/travel/travel-shell";

export const metadata = {
  title: "Plan Your Travel - TASI 2026",
  description: "Everything you need to plan your trip to TASI 2026 in New Delhi - hotel recommendations, visa information, how to reach the venue, and general travel tips.",
};

// Data

const sections = [
  {
    icon: Globe,
    title: "General Information",
    description:
      "Currency, time zone, emergency contacts, dress code, electricity, and essential tips for your stay in New Delhi.",
    href: "/plan-your-travel/general-info",
    accent: "bg-sky-500",
    border: "border-sky-200 dark:border-sky-800",
    bg: "bg-sky-50 dark:bg-sky-950/20",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconText: "text-sky-600 dark:text-sky-400",
    pillBg: "bg-sky-100 dark:bg-sky-900/30",
    pillText: "text-sky-700 dark:text-sky-300",
    pills: ["IST (GMT +5:30)", "INR (Indian Rupee)", "112 Emergency"],
  },
  {
    icon: Plane,
    title: "How to Reach",
    description:
      "Airports, railway stations, metro, and app-based taxis - everything you need to get to the summit venue.",
    href: "/plan-your-travel/how-to-reach",
    accent: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconText: "text-amber-600 dark:text-amber-400",
    pillBg: "bg-amber-100 dark:bg-amber-900/30",
    pillText: "text-amber-700 dark:text-amber-300",
    pills: ["IGI Airport - 16 km", "New Delhi Rly - 5 km", "Blue Line Metro"],
  },
  {
    icon: Shield,
    title: "Visa Information",
    description:
      "Visa waiver agreements, conference visas, e-Visa pathways, OCI requirements, and passport validity rules.",
    href: "/plan-your-travel/visa-information",
    accent: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    pillBg: "bg-emerald-100 dark:bg-emerald-900/30",
    pillText: "text-emerald-700 dark:text-emerald-300",
    pills: ["Visa Waivers", "Conference Visa", "e-Visa Available"],
  },
  {
    icon: Hotel,
    title: "Accommodation",
    description:
      "A curated selection of 26 premier hotels near the summit venue - luxury five-star properties to well-connected business hotels.",
    href: "/plan-your-travel/accommodation",
    accent: "bg-violet-500",
    border: "border-violet-200 dark:border-violet-800",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconText: "text-violet-600 dark:text-violet-400",
    pillBg: "bg-violet-100 dark:bg-violet-900/30",
    pillText: "text-violet-700 dark:text-violet-300",
    pills: ["26 Hotels", "Aerocity", "5-Star Properties"],
  },
];

const quickFacts = [
  { icon: Clock, label: "Time Zone", value: "IST (GMT +5:30)" },
  { icon: Banknote, label: "Currency", value: "INR (Indian Rupee)" },
  { icon: Zap, label: "Electricity", value: "220-240V / C-D" },
  { icon: Phone, label: "Emergency", value: "112" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PlanYourTravelPage() {
  return (
    <TravelShell>
      {/* Section cards */}
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              New Delhi Travel Guide
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Plan Every Step of Your Visit
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600 dark:text-stone-400">
              Select a section below to dive into detailed information on that topic.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`group relative overflow-hidden rounded-[10px] border p-6 transition hover:shadow-lg ${s.border} ${s.bg}`}
                >
                  <div className={`absolute top-0 left-0 h-1 w-full ${s.accent}`} />
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] ${s.iconBg}`}>
                      <Icon className={`h-5 w-5 ${s.iconText}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-stone-900 dark:text-white">{s.title}</h3>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                        {s.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {s.pills.map((p) => (
                          <span key={p} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.pillBg} ${s.pillText}`}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick facts strip */}
      <section className="border-t border-stone-200 bg-stone-50 px-4 py-12 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
            Essential Facts · New Delhi
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickFacts.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-[10px] border border-stone-200 bg-white p-5 text-center dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-900/30">
                  <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
                <p className="mt-0.5 font-bold text-stone-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-white px-4 py-12 dark:border-stone-800 dark:bg-stone-950 md:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-lg font-bold text-stone-900 dark:text-white">Ready to join us in New Delhi?</p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Register for TASI 2026 and secure your place at India&apos;s foremost trust and safety convening.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Register Now
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </TravelShell>
  );
}

