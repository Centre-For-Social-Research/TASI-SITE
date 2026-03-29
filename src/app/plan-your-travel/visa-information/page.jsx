import TravelShell from "@/components/travel/travel-shell";
import { Shield, Globe, FileText, Smartphone, CreditCard, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Visa Information – Plan Your Travel · TASI 2026",
  description:
    "Visa waiver agreements, conference visas, e-Visa pathways, OCI card requirements, and passport validity rules for TASI 2026 in New Delhi.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const pathways = [
  {
    icon: Globe,
    tag: "Diplomatic / Official Passport",
    title: "Visa Waiver Agreements",
    description:
      "The Government of India has bilateral Visa Waiver Agreements for holders of Diplomatic / Official / Service Passports in several countries.",
    cta: { label: "View Visa Waiver List", href: "https://www.mea.gov.in/bvwa-menu.htm" },
    accent: "bg-sky-500",
    border: "border-sky-200 dark:border-sky-800",
    bg: "bg-sky-50 dark:bg-sky-950/20",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconText: "text-sky-600 dark:text-sky-400",
    tagBg: "bg-sky-100 dark:bg-sky-900/30",
    tagText: "text-sky-700 dark:text-sky-300",
    ctaText: "text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100",
  },
  {
    icon: FileText,
    tag: "Diplomatic / Official Passport",
    title: "Regular Conference Visa",
    description:
      "Delegates holding Diplomatic / Official Passports of countries without a Visa Waiver Agreement may apply for a regular Conference Visa with multiple entries. Visas are issued gratis to all accredited delegates and accompanying spouses. Submit the visa application with your accreditation letter and a Note Verbale from your Ministry of Foreign Affairs to the nearest Indian Mission.",
    cta: { label: "Apply for Conference Visa", href: "https://indianvisaonline.gov.in/" },
    accent: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconText: "text-amber-600 dark:text-amber-400",
    tagBg: "bg-amber-100 dark:bg-amber-900/30",
    tagText: "text-amber-700 dark:text-amber-300",
    ctaText: "text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100",
  },
  {
    icon: Smartphone,
    tag: "Ordinary Passport · Eligible Countries",
    title: "e-Conference Visa",
    description:
      "Delegates holding Ordinary Passports from eligible countries under the e-Visa regime may apply for an e-Conference Visa online. Note: the e-Visa facility is not available for holders of Diplomatic / Official / Service Passports or International Travel Documents such as UNLP.",
    cta: { label: "Apply for e-Conference Visa", href: "https://indianvisaonline.gov.in/evisa/tvoa.html" },
    accent: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    tagBg: "bg-emerald-100 dark:bg-emerald-900/30",
    tagText: "text-emerald-700 dark:text-emerald-300",
    ctaText: "text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100",
  },
];

const additionalSections = [
  {
    icon: CreditCard,
    title: "Overseas Citizens of India (OCI)",
    description:
      "OCI cardholders attending the Summit as delegates must obtain prior permission from the Ministry of Home Affairs, Government of India. The accreditation letter issued by the Summit Secretariat must be uploaded when applying for such permission.",
    cta: { label: "Apply for OCI Permission", href: "https://ociservices.gov.in/onlineOCI/" },
  },
  {
    icon: AlertCircle,
    title: "Passport Requirements",
    description:
      "Delegates are requested to ensure that their passports have a minimum validity of six months beyond the date of arrival in India and at least two blank pages for visa endorsement. For delegates travelling on e-Conference Visas, biometric details will be mandatorily captured at the port of entry upon arrival in India.",
    cta: null,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VisaInformationPage() {
  return (
    <TravelShell>
      {/* Intro banner */}
      <section className="border-b border-stone-200 bg-stone-50 px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-900/40">
            <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-stone-900 dark:text-white">Entry Requirements for India</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              India offers multiple visa pathways for international delegates. Please check your eligibility and apply well in advance of the event.
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl space-y-12">

          {/* Section heading */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Entry Requirements
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Visa Information
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">
              Three primary visa pathways are available for delegates depending on passport type and country of origin.
            </p>
          </div>

          {/* Primary pathways */}
          <div className="grid gap-5 sm:grid-cols-3">
            {pathways.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className={`relative overflow-hidden rounded-[10px] border p-6 ${p.border} ${p.bg}`}
                >
                  <div className={`absolute top-0 left-0 h-1 w-full ${p.accent}`} />
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] ${p.iconBg}`}>
                    <Icon className={`h-6 w-6 ${p.iconText}`} />
                  </div>
                  <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.tagBg} ${p.tagText}`}>
                    {p.tag}
                  </span>
                  <h3 className="mb-2 text-base font-bold text-stone-900 dark:text-white">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{p.description}</p>
                  {p.cta && (
                    <a
                      href={p.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${p.ctaText}`}
                    >
                      {p.cta.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* OCI + Passport requirements */}
          <div className="grid gap-5 sm:grid-cols-2">
            {additionalSections.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-[10px] border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-900"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-stone-200 dark:bg-stone-700">
                      <Icon className="h-5 w-5 text-stone-600 dark:text-stone-300" />
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-white">{s.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{s.description}</p>
                  {s.cta && (
                    <a
                      href={s.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
                    >
                      {s.cta.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA box */}
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">Need assistance with your visa?</p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
              Contact the TASI 2026 Secretariat for a copy of your accreditation letter or for any visa-related queries.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Contact Secretariat
            </Link>
          </div>

        </div>
      </div>
    </TravelShell>
  );
}
