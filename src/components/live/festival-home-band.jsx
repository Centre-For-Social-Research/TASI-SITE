'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import festivalPhase from '@/lib/festival-phase.cjs';

import { LiveNowStrip } from './live-now-board';
import { useFestivalClock } from './use-festival-clock';

const { getFestivalPhase } = festivalPhase;

const MONO = 'font-[family-name:var(--font-admin-mono)]';

function BandShell({ children }) {
  return (
    <section className="border-b border-white/10 bg-[#0d0b1f] px-4 py-8 text-white md:px-8 md:py-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {children}
      </div>
    </section>
  );
}

function BandLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#ffd919] hover:underline"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function CountdownTile({ value, label }) {
  return (
    <div className="flex w-[4.75rem] flex-col items-center rounded-[10px] border border-white/10 bg-white/[0.04] py-3 md:w-24 md:py-4">
      <span
        className={`${MONO} text-3xl font-medium leading-none text-[#ffd919] md:text-5xl`}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
        {label}
      </span>
    </div>
  );
}

function Countdown({ countdown }) {
  return (
    <BandShell>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8fa3]">
          TASI 2026 · India International Centre, New Delhi
        </p>
        <p className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          Doors open at <span className={MONO}>09:00</span> on 14 October.
        </p>
        <div className="mt-3">
          <BandLink href="/programme">See the programme</BandLink>
        </div>
      </div>
      <div
        className="flex items-center gap-2 md:gap-3"
        aria-label={`${countdown.days} days, ${countdown.hours} hours and ${countdown.minutes} minutes to go`}
      >
        <CountdownTile value={countdown.days} label="Days" />
        <span className={`${MONO} text-2xl text-white/25`}>:</span>
        <CountdownTile value={countdown.hours} label="Hours" />
        <span className={`${MONO} text-2xl text-white/25`}>:</span>
        <CountdownTile value={countdown.minutes} label="Min" />
      </div>
    </BandShell>
  );
}

function DayNote({ title }) {
  return (
    <BandShell>
      <p className="text-xl font-extrabold tracking-tight md:text-2xl">
        {title}
      </p>
      <BandLink href="/programme">See the programme</BandLink>
    </BandShell>
  );
}

function Thanks() {
  return (
    <BandShell>
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8fa3]">
          TASI 2026 · That&apos;s a wrap
        </p>
        <p className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          Thank you for coming.
        </p>
        <p className="mt-2 text-base leading-relaxed text-white/75">
          Two days, three rooms and a lot of hard conversations about keeping
          people safe online. Thank you to every speaker, partner and delegate
          who made it to the IIC.
        </p>
      </div>
      <Link
        href="/tasi-2026"
        className="inline-flex flex-none items-center gap-2 self-start rounded-full bg-[#ffd919] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#350265] transition hover:brightness-105 md:self-center"
      >
        See the highlights
        <ArrowRight className="h-4 w-4" />
      </Link>
    </BandShell>
  );
}

// One band under the homepage hero whose content follows the date: a
// countdown before the festival, Now and Next during it, thanks afterwards.
export default function FestivalHomeBand({ sessions }) {
  const now = useFestivalClock();
  if (now === null) return null;

  const { phase, countdown, live } = getFestivalPhase(sessions, now);

  if (phase === 'countdown') return <Countdown countdown={countdown} />;
  if (phase === 'thanks') return <Thanks />;
  if (phase !== 'live') return null;

  if (live.state === 'live') return <LiveNowStrip sessions={sessions} />;
  if (live.state === 'before') {
    return (
      <DayNote
        title={`${live.day.label} starts at ${live.firstSession.time.split(/[–-]/)[0]} today.`}
      />
    );
  }
  if (live.state === 'after') {
    return (
      <DayNote
        title={`That's ${live.day.label}. ${live.nextDay.label} starts at ${live.nextDayStart || '09:00'} tomorrow.`}
      />
    );
  }
  return null;
}
