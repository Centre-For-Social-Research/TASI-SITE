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

// Every piece of text in the strip shares one size so it reads as a single line.
const STRIP_TEXT = 'text-xs font-black uppercase tracking-[0.14em] md:text-sm';

function CountdownTile({ value, label }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-[10px] bg-[#350265] px-2.5 py-1.5">
      <span className={`${MONO} ${STRIP_TEXT} text-[#ffd919]`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className={`${STRIP_TEXT} text-white/70`}>{label}</span>
    </div>
  );
}

function Countdown({ countdown }) {
  return (
    <section className="border-b border-[#350265]/10 bg-white px-4 py-2.5 text-[#350265] md:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div
          className={`${STRIP_TEXT} flex flex-wrap items-center gap-x-4 gap-y-1`}
        >
          <span>TASI 2026 · IIC, New Delhi</span>
          <span className="hidden h-3 w-px bg-[#350265]/30 md:block" />
          <span>
            Doors open <span className={MONO}>09:00</span>, 14 October
          </span>
          <Link
            href="/programme"
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
          >
            Programme
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div
          className="flex items-center gap-1.5"
          aria-label={`${countdown.days} days, ${countdown.hours} hours and ${countdown.minutes} minutes to go`}
        >
          <CountdownTile value={countdown.days} label="Days" />
          <CountdownTile value={countdown.hours} label="Hrs" />
          <CountdownTile value={countdown.minutes} label="Min" />
        </div>
      </div>
    </section>
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
