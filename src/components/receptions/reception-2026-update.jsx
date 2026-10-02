'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lock, MapPin } from 'lucide-react';

import {
  MotionItem,
  MotionReveal,
  MotionStagger,
} from '@/components/ui/motion-reveal';
import {
  receptions2026,
  receptionsAttendance2026,
} from '@/data/receptions-2026';

import { ReceptionOverviewCard } from './reception-ui';

function toOverviewCard(event) {
  const venue = event.venue || event.session.venue;
  return {
    slug: event.slug,
    shortDate: `Oct ${event.day}`,
    title: event.card.title || event.session.title,
    theme: event.card.theme,
    venue: `${venue}, New Delhi`,
    summary: event.card.summary,
    hostLogos: event.hosts,
    access: 'Invite only',
  };
}

function ReceptionOverview2026() {
  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-4xl">
            Three evenings around the festival
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-slate-300">
            Two embassy receptions open and close TASI 2026, with a private
            Match Group Policy Lab at the end of the first day. All are by
            invitation only.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-12 grid gap-6 xl:grid-cols-3">
          {receptions2026.map((event) => (
            <MotionItem key={event.slug}>
              <ReceptionOverviewCard reception={toOverviewCard(event)} />
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}

function HostLogos({ hosts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {hosts.map((host) => (
        <div
          key={host.name}
          className="relative h-12 w-28 overflow-hidden rounded-[10px] border border-stone-200 bg-white dark:border-slate-700"
        >
          <Image
            src={host.logo}
            alt={host.name}
            fill
            className="object-contain p-1"
            sizes="112px"
          />
        </div>
      ))}
    </div>
  );
}

function EventRow({ event }) {
  const { session } = event;
  const venue = event.venue || session.venue;

  return (
    <MotionReveal>
      <article
        id={event.slug}
        className="grid scroll-mt-28 gap-6 py-12 md:grid-cols-[9rem_1fr] md:gap-10 md:py-16"
      >
        <div className="flex items-baseline gap-3 md:block">
          <p className="text-5xl font-black leading-none tracking-tight text-rc-primary dark:text-amber-300 md:text-6xl">
            {event.day}
          </p>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400 md:mt-2">
            {event.weekday} · Oct
          </p>
        </div>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-amber-300">
            {event.kind === 'Private side event' ? (
              <Lock className="h-3.5 w-3.5" />
            ) : null}
            {event.kind}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-3xl">
            {session.title}
          </h3>

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600 dark:text-slate-400">
            <span className="tabular-nums">{session.time}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {venue}
            </span>
          </p>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-700 dark:text-slate-300">
            {event.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <HostLogos hosts={event.hosts} />
            <p className="text-sm text-stone-600 dark:text-slate-400">
              {event.hostLine}
            </p>
          </div>
        </div>
      </article>
    </MotionReveal>
  );
}

export default function Reception2026Update() {
  const { note, contactEmail } = receptionsAttendance2026;

  return (
    <>
      <ReceptionOverview2026 />
      <section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-md">
        <div className="mx-auto w-full max-w-[1000px] px-4 md:px-8">
          <div className="divide-y divide-stone-200 border-y border-stone-200 dark:divide-slate-800 dark:border-slate-800">
            {receptions2026.map((event) => (
              <EventRow key={event.slug} event={event} />
            ))}
          </div>

          <MotionReveal>
            <div className="mt-10 flex flex-col gap-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400 md:flex-row md:items-start md:gap-10">
              <p className="font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-500 md:w-[9rem] md:flex-none">
                Attending
              </p>
              <p>
                {note} Questions about an invitation? Write to{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
                >
                  {contactEmail}
                </a>
                . The full schedule is on the{' '}
                <Link
                  href="/programme"
                  className="font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
                >
                  programme page
                </Link>
                .
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>
    </>
  );
}
