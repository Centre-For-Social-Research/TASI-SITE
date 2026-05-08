import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';
import {
  travelColorStyles,
  visaAdditionalSections,
  visaPathways,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';
import { travelIcons } from './travel-icons';

export default function VisaInformationPage() {
  return (
    <TravelShell>
      <section className="border-b border-stone-200 bg-stone-50 px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-900/40">
            <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-stone-900 dark:text-white">
              Entry Requirements for India
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              India offers multiple visa pathways for international delegates.
              Please check your eligibility and apply well in advance of the
              event.
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Entry Requirements
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Visa Information
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">
              Three primary visa pathways are available for delegates depending
              on passport type and country of origin.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {visaPathways.map((pathway) => {
              const Icon = travelIcons[pathway.icon];
              const theme = travelColorStyles[pathway.theme];

              return (
                <div
                  key={pathway.title}
                  className={`relative overflow-hidden rounded-[10px] border p-6 ${theme.border} ${theme.bg}`}
                >
                  <div
                    className={`absolute top-0 left-0 h-1 w-full ${theme.accent}`}
                  />
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] ${theme.iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${theme.iconText}`} />
                  </div>
                  <span
                    className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${theme.pillBg} ${theme.pillText}`}
                  >
                    {pathway.tag}
                  </span>
                  <h3 className="mb-2 text-base font-bold text-stone-900 dark:text-white">
                    {pathway.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {pathway.description}
                  </p>
                  {pathway.cta && (
                    <a
                      href={pathway.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${theme.ctaText}`}
                    >
                      {pathway.cta.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {visaAdditionalSections.map((section) => {
              const Icon = travelIcons[section.icon];

              return (
                <div
                  key={section.title}
                  className="rounded-[10px] border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-900"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-stone-200 dark:bg-stone-700">
                      <Icon className="h-5 w-5 text-stone-600 dark:text-stone-300" />
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {section.description}
                  </p>
                  {section.cta && (
                    <a
                      href={section.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
                    >
                      {section.cta.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              Need assistance with your visa?
            </p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
              Contact the TASI 2026 Secretariat for a copy of your accreditation
              letter or for any visa-related queries.
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
