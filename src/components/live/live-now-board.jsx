'use client';

import Link from 'next/link';
import { ArrowRight, Coffee } from 'lucide-react';

import liveProgramme from '@/lib/live-programme.cjs';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';

import { useFestivalClock } from './use-festival-clock';

const { formatIstClock, getLiveProgramme, slotStart } = liveProgramme;
const { getProgrammeSessionPath } = programmeAgendaUtils;

const MONO = 'font-[family-name:var(--font-admin-mono)]';

const DAY_NAMES = {
  oct14: 'Wednesday 14 October',
  oct15: 'Thursday 15 October',
};

function LivePulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b5c] opacity-75 motion-reduce:hidden" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff3b5c]" />
    </span>
  );
}

function BoardHeader({ live, clock }) {
  return (
    <div className="flex flex-col gap-6 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff8fa3]">
          <LivePulse />
          Live at TASI 2026
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {live.day.label}
          <span className="text-white/45"> · {DAY_NAMES[live.day.key]}</span>
        </h2>
      </div>
      <div className="flex items-baseline gap-3 md:flex-col md:items-end md:gap-1">
        <p
          className={`${MONO} text-5xl font-medium leading-none tracking-tight text-[#ffd919] md:text-6xl`}
        >
          {clock}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
          India Standard Time
        </p>
      </div>
    </div>
  );
}

function NowBlock({ session }) {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <Link
        href={getProgrammeSessionPath(session)}
        className="group text-lg font-extrabold leading-snug text-white md:text-xl"
      >
        <span className="underline-offset-4 group-hover:underline">
          {session.title}
        </span>
      </Link>
      <div>
        {session.speakers?.length ? (
          <p className="mb-3 text-sm leading-snug text-white/60">
            with {session.speakers.join(', ')}
          </p>
        ) : null}
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#ffd919,#ff6b9d)]"
            style={{ width: `${Math.round(session.progress * 100)}%` }}
          />
        </div>
        <div
          className={`${MONO} mt-2.5 flex justify-between text-[11px] uppercase tracking-wider`}
        >
          <span className="text-white/50">{session.time}</span>
          <span className="text-[#ffd919]">{session.minutesLeft} min left</span>
        </div>
      </div>
    </div>
  );
}

function FeaturedNext({ session }) {
  return (
    <div>
      <p
        className={`${MONO} text-[11px] uppercase tracking-wider text-white/50`}
      >
        Up next · <span className="text-[#ffd919]">{slotStart(session)}</span> ·
        in {formatWait(session.minutesUntil)}
      </p>
      <Link
        href={getProgrammeSessionPath(session)}
        className="group mt-2 text-lg font-extrabold leading-snug text-white/90 md:text-xl"
      >
        <span className="underline-offset-4 group-hover:underline">
          {session.title}
        </span>
      </Link>
    </div>
  );
}

function formatWait(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function RoomColumn({ room, now, next, later }) {
  // When the room is free, its next session takes the main slot and the
  // one after it moves into "Next".
  const featured = now || next;
  const following = now ? next : later;

  return (
    <div className="flex flex-col p-6 md:row-span-3 md:grid md:grid-rows-subgrid md:gap-0 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
          {room}
        </p>
        {now ? (
          <span className="rounded-full bg-[#ff3b5c] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
            On now
          </span>
        ) : (
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
            {next ? 'Free' : 'Done'}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col">
        {now ? <NowBlock session={now} /> : null}
        {!now && featured ? <FeaturedNext session={featured} /> : null}
        {!featured ? (
          <p className="text-sm leading-relaxed text-white/50">
            Sessions in this room are done for the day.
          </p>
        ) : null}
      </div>

      <div className="mt-5 border-t border-dashed border-white/15 pt-4">
        {following ? (
          <>
            <p
              className={`${MONO} text-[11px] uppercase tracking-wider text-[#ffd919]`}
            >
              {now ? 'Next' : 'Then'} · {slotStart(following)}
            </p>
            <Link
              href={getProgrammeSessionPath(following)}
              className="mt-1.5 block text-sm font-semibold leading-snug text-white/85 underline-offset-4 hover:underline"
            >
              {following.title}
            </Link>
          </>
        ) : (
          <p
            className={`${MONO} text-[11px] uppercase tracking-wider text-white/35`}
          >
            Nothing after this
          </p>
        )}
      </div>
    </div>
  );
}

function LobbyTicker({ lobby }) {
  const item = lobby.now || lobby.next;
  if (!item) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm">
      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/60">
        <Coffee className="h-4 w-4" />
        Lobby
      </span>
      <span className="font-semibold text-white">{item.title}</span>
      <span className={`${MONO} text-xs uppercase text-white/50`}>
        {lobby.now
          ? `until ${item.time.split(/[–-]/)[1]}`
          : `from ${slotStart(item)}`}
      </span>
    </div>
  );
}

function BoardShell({ id, children }) {
  return (
    <section
      id={id}
      aria-live="polite"
      className="scroll-mt-24 bg-[radial-gradient(ellipse_at_85%_0%,#3a1a6e_0%,transparent_55%),linear-gradient(180deg,#0d0b1f_0%,#120a26_100%)] px-4 py-12 text-white md:px-8 md:py-16 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1300px]">{children}</div>
    </section>
  );
}

export default function LiveNowBoard({ sessions }) {
  const now = useFestivalClock();
  if (now === null) return null;

  const live = getLiveProgramme(sessions, now);
  if (live.state === 'inactive' || live.state === 'ended') return null;

  const clock = formatIstClock(now);

  if (live.state === 'after') {
    return (
      <BoardShell id="live-now">
        <BoardHeader live={live} clock={clock} />
        <p className="mt-7 text-xl font-bold text-white md:text-2xl">
          That&apos;s a wrap for {live.day.label}.
          <span className="text-white/55">
            {' '}
            {live.nextDay.label} starts tomorrow
            {live.nextDayStart ? ` at ${live.nextDayStart}` : ''}.
          </span>
        </p>
      </BoardShell>
    );
  }

  return (
    <BoardShell id="live-now">
      <BoardHeader live={live} clock={clock} />

      {live.state === 'before' ? (
        <p className="mt-6 text-base text-white/75">
          Doors open at{' '}
          <span className={`${MONO} text-[#ffd919]`}>
            {slotStart(live.firstSession)}
          </span>{' '}
          with {live.firstSession.title}. Here&apos;s what opens each room.
        </p>
      ) : null}

      <div className="mt-8 grid overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.03] md:grid-cols-3 md:grid-rows-[auto_1fr_auto] md:divide-x md:divide-white/10 max-md:divide-y max-md:divide-white/10">
        {live.rooms.map((item) => (
          <RoomColumn key={item.room} {...item} />
        ))}
      </div>

      <LobbyTicker lobby={live.lobby} />
    </BoardShell>
  );
}

// One-line-per-room summary for the homepage.
export function LiveNowStrip({ sessions }) {
  const now = useFestivalClock();
  if (now === null) return null;

  const live = getLiveProgramme(sessions, now);
  if (live.state !== 'live') return null;

  return (
    <div className="border-b border-white/10 bg-[#0d0b1f] px-4 py-4 text-white md:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
        <p className="flex flex-none items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff8fa3]">
          <LivePulse />
          Live now
          <span className={`${MONO} text-[#ffd919]`}>
            {formatIstClock(now)}
          </span>
        </p>
        <ul className="grid flex-1 gap-2 text-sm md:grid-cols-3 md:gap-6">
          {live.rooms.map(({ room, now: current, next }) => (
            <li key={room} className="min-w-0 truncate">
              <span className="text-white/50">{room} · </span>
              <span className="font-semibold text-white">
                {current
                  ? current.title
                  : next
                    ? `Next at ${slotStart(next)}`
                    : 'Done for today'}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/programme#live-now"
          className="inline-flex flex-none items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#ffd919] hover:underline"
        >
          Full live view
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
