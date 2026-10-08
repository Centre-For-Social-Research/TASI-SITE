import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import {
  travelCardStyle as style,
  travelOverviewSections,
  travelQuickFacts,
  travelVenue,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';
import { travelIcons } from './travel-icons';

export default function PlanTravelOverviewPage() {
  return (
    <TravelShell>
      <section className="border-b border-[#350265]/10 bg-white px-4 py-10 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
          {travelQuickFacts.map(({ icon, label, value }) => {
            const Icon = travelIcons[icon];

            return (
              <div key={label} className="text-center">
                <div
                  className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] ${style.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${style.iconText}`} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {label}
                </p>
                <p className="mt-1 font-bold text-stone-900 dark:text-white">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col gap-4 rounded-[10px] bg-[#350265] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffd919]">
                The venue
              </p>
              <p className="mt-2 text-xl font-black md:text-2xl">
                {travelVenue.name}
              </p>
              <p className="mt-1 text-white/80">{travelVenue.address}</p>
            </div>
            <a
              href={travelVenue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-none items-center gap-2 self-start rounded-full bg-[#ffd919] px-5 py-2.5 text-sm font-bold text-[#350265] transition hover:brightness-105 md:self-center"
            >
              <MapPin className="h-4 w-4" />
              Open in Maps
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {travelOverviewSections.map((section) => {
              const Icon = travelIcons[section.icon];

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`group rounded-[10px] border p-6 transition hover:-translate-y-0.5 hover:shadow-md ${style.border} ${style.bg}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] ${style.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${style.iconText}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-stone-900 dark:text-white">
                          {section.title}
                        </h2>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-[#350265] dark:group-hover:text-[#ffd919]" />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                        {section.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {section.pills.map((pill) => (
                          <span
                            key={pill}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.pillBg} ${style.pillText}`}
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

      <section className="px-4 pb-16 md:pb-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-[10px] border border-[#350265]/15 bg-white px-6 py-8 dark:border-stone-700 dark:bg-stone-900 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-lg font-bold text-stone-900 dark:text-white">
              Not registered yet?
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Register on the website to get your QR entry pass by email.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <Link
              href="/register"
              className="rounded-full bg-[#350265] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#55089e]"
            >
              Register
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#350265]/30 px-6 py-2.5 text-sm font-bold text-[#350265] transition hover:bg-[#350265]/5 dark:border-white/30 dark:text-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </TravelShell>
  );
}
