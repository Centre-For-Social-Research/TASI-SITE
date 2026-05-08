import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  travelColorStyles,
  travelOverviewSections,
  travelQuickFacts,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';
import { travelIcons } from './travel-icons';

export default function PlanTravelOverviewPage() {
  return (
    <TravelShell>
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
              New Delhi Travel Guide
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Plan Every Step of Your Visit
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600 dark:text-stone-400">
              Select a section below to dive into detailed information on that
              topic.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {travelOverviewSections.map((section) => {
              const Icon = travelIcons[section.icon];
              const theme = travelColorStyles[section.theme];

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`group relative overflow-hidden rounded-[10px] border p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.22)] ${theme.border} ${theme.bg}`}
                >
                  <div
                    className={`absolute top-0 left-0 h-1 w-full ${theme.accent}`}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] ${theme.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${theme.iconText}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-stone-900 dark:text-white">
                          {section.title}
                        </h3>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                        {section.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {section.pills.map((pill) => (
                          <span
                            key={pill}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${theme.pillBg} ${theme.pillText}`}
                          >
                            {pill}
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

      <section className="border-t border-orange-100 bg-orange-50/50 px-4 py-12 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
            Essential Facts - New Delhi
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {travelQuickFacts.map(({ icon, label, value }) => {
              const Icon = travelIcons[icon];

              return (
                <div
                  key={label}
                  className="rounded-[10px] border border-stone-200 bg-white p-5 text-center dark:border-stone-700 dark:bg-stone-800"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-900/30">
                    <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {label}
                  </p>
                  <p className="mt-0.5 font-bold text-stone-900 dark:text-white">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-6 dark:bg-stone-950 md:pb-20">
        <div className="mx-auto max-w-5xl rounded-[10px] bg-[linear-gradient(145deg,#111827,#1f2937,#7c2d12)] px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:flex md:items-center md:justify-between md:text-left">
          <div>
            <p className="text-lg font-bold text-white">
              Ready to join us in New Delhi?
            </p>
            <p className="mt-1 text-sm text-stone-300">
              Register for TASI 2026 and secure your place at India&apos;s
              foremost trust and safety convening.
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
              className="rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </TravelShell>
  );
}
