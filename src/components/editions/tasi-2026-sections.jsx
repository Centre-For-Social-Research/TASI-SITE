import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Tasi2025TrackIllustration from '@/components/editions/tasi-2025-track-illustration';
import { MotionReveal } from '@/components/ui/motion-reveal';
import { programmeSessions2026 } from '@/data/programme-2026';
import {
  tasi2026FuturePriorities,
  tasi2026Gallery,
  tasi2026HighlightsVideoSrc,
  tasi2026Ideas,
  tasi2026Launches,
  tasi2026MoreQuotes,
  tasi2026PerspectiveQuote,
  tasi2026Quotes,
  tasi2026Recommendations,
  tasi2026SessionRecaps,
  tasi2026Stats,
} from '@/data/tasi-2026-edition';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';

const { getProgrammeSessionPath } = programmeAgendaUtils;

const sessionsById = new Map(
  programmeSessions2026.map((session) => [session.id, session])
);

const dayLabels = { oct13: '13 Oct', oct14: '14 Oct', oct15: '15 Oct' };

// "Panel: Growing Up Digital" reads as "Growing Up Digital" in a compact link.
function shortSessionTitle(title) {
  return title.replace(
    /^(Panel|Spotlight|Sponsor Spotlight|Fireside Chat|Roundtable|Report Launch|Closing Plenary|Opening Panel): /,
    ''
  );
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

function Avatar({ name, photo, size = 'h-12 w-12' }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${size}`}
    >
      {photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover"
          sizes="64px"
        />
      ) : (
        <span
          aria-hidden="true"
          className="text-sm font-black text-rc-primary dark:text-white"
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}

function SectionIntro({ eyebrow, title, children, dark = false }) {
  return (
    <div className="max-w-3xl">
      <p
        className={`mb-4 text-xs font-black uppercase tracking-[0.18em] md:text-sm ${
          dark
            ? 'text-rc-secondary dark:text-white'
            : 'text-rc-accent dark:text-white'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem] ${
          dark ? 'text-white' : 'text-stone-900 dark:text-white'
        }`}
      >
        {title}
      </h2>
      {children ? (
        <p
          className={`mt-5 text-body-lg ${
            dark ? 'text-white/80' : 'text-stone-700 dark:text-slate-300'
          }`}
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}

export function Tasi2026NumbersBand() {
  return (
    <section
      aria-label="TASI 2026 in numbers"
      className="bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-10 text-white md:py-12"
    >
      <div className="mx-auto grid w-full max-w-[1300px] grid-cols-2 gap-x-6 gap-y-8 px-4 sm:grid-cols-3 md:px-8 lg:grid-cols-6 lg:px-16">
        {tasi2026Stats.map(([num, label]) => (
          <div key={label} className="border-l-2 border-rc-secondary/70 pl-4">
            <p className="text-4xl font-black leading-none text-rc-secondary dark:text-white md:text-5xl">
              {num}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/75 md:text-sm">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Tasi2026AboutSection() {
  return (
    <section
      id="about-festival"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg"
    >
      <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 px-4 md:grid-cols-[1.15fr_0.85fr] md:px-8 lg:px-16">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
            The Second Edition
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3rem]">
            From Naming Harms to Owning Them
          </h2>
          <p className="mt-5 text-body-lg leading-relaxed text-stone-700 dark:text-slate-300">
            TASI 2026 opened on the evening of 13 October with a reception at
            the Goethe-Institut, hosted with the embassies of Germany and
            France. Two days of sessions followed in New Delhi on 14 and 15
            October, under the theme People First. Safety Always.
          </p>
          <p className="mt-4 text-body-md leading-relaxed text-stone-600 dark:text-slate-400">
            Speakers ranged from a Minister of State and the NCPCR to Roblox,
            OpenAI, Google and Anthropic, and from survivors&apos; groups to
            students and researchers from Nepal, Sri Lanka, Kenya and Korea.
          </p>
          <div className="mt-8 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 md:p-7">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-white">
              Perspective
            </p>
            <p className="text-lg leading-relaxed text-stone-800 dark:text-slate-100 md:text-xl">
              &quot;{tasi2026PerspectiveQuote.text}&quot;
            </p>
            <p className="mt-5 text-sm font-medium text-stone-500 dark:text-slate-400">
              {tasi2026PerspectiveQuote.author}
            </p>
          </div>
        </div>

        <article className="group overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative aspect-[4/5] md:aspect-[4/4.4]">
            <Image
              src="/img/tasi-2026/closing-reception-full-room.webp"
              alt="A full room of guests at the TASI 2026 closing reception in New Delhi"
              fill
              className="scale-[1.05] object-cover transition duration-500 group-hover:scale-[1.08]"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </div>
        </article>
      </div>
    </section>
  );
}

export function Tasi2026HighlightsVideoSection() {
  return (
    <section
      id="festival-highlights"
      className="scroll-mt-24 bg-[#0d0b1f] py-section-sm text-white md:py-section-lg"
    >
      <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 px-4 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
        <SectionIntro
          eyebrow="Festival Highlights"
          title="Relive Two Days of TASI 2026"
          dark
        >
          Keynotes, panels, roundtables and receptions across the Main Hall, the
          Roundtable Room and the Workshop Room, in one minute.
        </SectionIntro>
        <div className="overflow-hidden rounded-[10px] border border-white/10 bg-black shadow-2xl shadow-black/40">
          <div className="relative aspect-video w-full">
            <iframe
              src={tasi2026HighlightsVideoSrc}
              title="TASI 2026 Highlights"
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function IdeaChapter({ idea, flip }) {
  return (
    <MotionReveal>
      <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className={`relative lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] shadow-2xl shadow-stone-900/15">
            <Image
              src={idea.image}
              alt={idea.imageAlt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
          <span
            aria-hidden="true"
            className={`absolute -top-8 text-[6rem] font-black leading-none text-rc-secondary drop-shadow-[0_6px_18px_rgba(53,2,101,0.35)] md:-top-12 md:text-[9rem] ${
              flip ? 'right-4 md:-right-4' : 'left-4 md:-left-4'
            }`}
          >
            {idea.number}
          </span>
        </div>

        <div className="lg:col-span-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
            Idea {idea.number}
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-4xl">
            {idea.title}
          </h3>
          <p className="mt-4 text-body-md leading-relaxed text-stone-700 dark:text-slate-300">
            {idea.body}
          </p>

          <div className="mt-6 rounded-[10px] border-l-4 border-rc-secondary bg-[#350265] p-5 text-white shadow-lg shadow-[#350265]/20">
            <p className="text-4xl font-black leading-none text-rc-secondary md:text-5xl">
              {idea.stat.value}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              {idea.stat.label}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Cited by {idea.stat.source}
            </p>
          </div>

          <blockquote className="mt-6 flex gap-4">
            <Avatar name={idea.quote.author} photo={idea.quote.photo} />
            <div>
              <p className="text-lg font-semibold leading-snug text-stone-900 dark:text-white">
                &ldquo;{idea.quote.text}&rdquo;
              </p>
              <cite className="mt-2 block text-sm not-italic text-stone-500 dark:text-slate-400">
                <span className="font-semibold text-stone-700 dark:text-slate-200">
                  {idea.quote.author}
                </span>
                , {idea.quote.role}
              </cite>
            </div>
          </blockquote>

          <div className="mt-6 flex flex-wrap gap-2">
            {idea.sessions
              .map((id) => sessionsById.get(id))
              .filter(Boolean)
              .map((session) => (
                <Link
                  key={session.id}
                  href={getProgrammeSessionPath(session)}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-[10px] border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-rc-primary hover:text-rc-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white dark:hover:text-white"
                >
                  <span className="truncate">
                    {shortSessionTitle(session.title)}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                </Link>
              ))}
          </div>
        </div>
      </article>
    </MotionReveal>
  );
}

export function Tasi2026IdeasSection() {
  return (
    <section
      id="five-ideas"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#0b1220_0%,#111827_100%)] md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="What We Heard"
          title="Five Things TASI 2026 Made Clear"
        >
          Across 55+ sessions, the same five ideas surfaced again and again,
          from different people in different rooms. Each came with evidence: a
          study, a launch, or a commitment made on stage.
        </SectionIntro>
        <div className="mt-20 grid gap-24 md:mt-24 md:gap-32">
          {tasi2026Ideas.map((idea, index) => (
            <IdeaChapter key={idea.number} idea={idea} flip={index % 2 === 1} />
          ))}
        </div>
        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-stone-500 dark:text-slate-400">
          Figures are claims made on stage, credited to the speaker who cited
          them. Quotes are reproduced word for word from session recordings.
        </p>
      </div>
    </section>
  );
}

export function Tasi2026LaunchesSection() {
  return (
    <section
      id="launches"
      className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="New at the Festival"
          title="Launched at TASI 2026"
        >
          Reports, tools and campaigns that partners unveiled on stage in New
          Delhi.
        </SectionIntro>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tasi2026Launches.map((launch, index) => (
            <article
              key={launch.title}
              className="relative rounded-[10px] border border-stone-200 bg-stone-50/70 p-7 shadow-lg shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-8"
            >
              <span className="absolute right-6 top-6 text-sm font-black text-stone-300 dark:text-slate-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Tasi2025TrackIllustration variant={launch.illustration} />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rc-primary dark:text-white/70">
                {launch.by}
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                {launch.title}
              </h3>
              <div className="mt-5 h-1 w-14 rounded-full bg-rc-accent dark:bg-white" />
              <p className="mt-5 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
                {launch.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2026VoicesSection() {
  const [featured, ...rest] = tasi2026Quotes;
  const others = [
    ...rest.map((quote) => {
      const [author, ...role] = quote.author.split(',');
      return { ...quote, author, role: role.join(',').trim() };
    }),
    ...tasi2026MoreQuotes,
  ];
  const [featuredName, ...featuredRole] = featured.author.split(',');

  return (
    <section
      id="voices"
      className="bg-gradient-to-br from-[#15002b] via-[#360454] to-[#5c0f4f] py-section-sm text-white md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="Voices from TASI 2026"
          title="What Leaders Said"
          dark
        />

        <MotionReveal>
          <figure className="mt-12 grid items-center gap-8 rounded-[10px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm md:grid-cols-[220px_1fr] md:p-10">
            <div>
              <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-[10px] md:w-full">
                <Image
                  src={featured.photo}
                  alt={featuredName}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>
              {featured.photoCredit ? (
                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/45">
                  {featured.photoCredit}
                </p>
              ) : null}
            </div>
            <div>
              <span
                aria-hidden="true"
                className="block text-7xl font-black leading-none text-rc-secondary"
              >
                &ldquo;
              </span>
              <blockquote className="-mt-4 text-2xl font-semibold leading-snug md:text-3xl">
                {featured.text}
              </blockquote>
              <figcaption className="mt-6 text-sm text-white/70">
                <span className="font-bold text-white">{featuredName}</span>,{' '}
                {featuredRole.join(',').trim()}
              </figcaption>
            </div>
          </figure>
        </MotionReveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {others.map((quote) => (
            <figure
              key={quote.author}
              className="flex h-full flex-col justify-between rounded-[10px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm md:p-8"
            >
              <blockquote className="text-lg leading-relaxed text-white/90">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={quote.author} photo={quote.photo} />
                <span className="text-sm text-white/70">
                  <span className="block font-bold text-white">
                    {quote.author}
                  </span>
                  {quote.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2026SessionsSection() {
  const recaps = tasi2026SessionRecaps
    .map((recap) => ({ ...recap, session: sessionsById.get(recap.id) }))
    .filter((recap) => recap.session);

  return (
    <section
      id="inside-the-sessions"
      className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            eyebrow="Inside the Sessions"
            title="Twelve Sessions to Start With"
          >
            What was said in the rooms that shaped the festival&apos;s story.
          </SectionIntro>
          <Link
            href="/programme"
            className="inline-flex items-center gap-2 text-sm font-bold text-rc-primary underline decoration-[1.5px] underline-offset-4 dark:text-white"
          >
            Full programme <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recaps.map(({ id, summary, session }) => (
            <Link
              key={id}
              href={getProgrammeSessionPath(session)}
              className="group flex h-full flex-col rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rc-primary/40 hover:shadow-xl dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] md:p-7"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-rc-accent dark:text-white/70">
                {dayLabels[session.day] || session.day} · {session.venue}
              </p>
              <h3 className="mt-3 text-lg font-bold leading-snug text-stone-900 dark:text-white">
                {shortSessionTitle(session.title)}
              </h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                {summary}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-rc-primary transition-all group-hover:gap-2.5 dark:text-white">
                Session page{' '}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2026RecommendationsSection() {
  return (
    <section
      id="core-takeaways"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="Recommendations"
          title="What the Room Recommended"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_100%)] p-8 text-white shadow-xl shadow-[#350265]/20 md:p-10 lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
              Carried Forward
            </p>
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              From the room to policymakers
            </h3>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              Recommendations heard across sessions on 14 and 15 October. TASI
              will carry them to policymakers and platforms, as the Minister
              asked: the festival&apos;s ideas should reach government.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {tasi2026Recommendations.map((item, index) => (
              <article
                key={item}
                className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-7"
              >
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-rc-primary dark:text-white/70">
                  Priority {String(index + 1).padStart(2, '0')}
                </p>
                <p className="text-body-md leading-relaxed text-stone-800 dark:text-slate-200">
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Collage spans for the 10 gallery photos on a 4-column grid.
const gallerySpans = [
  'col-span-2 row-span-2',
  '',
  '',
  'col-span-2',
  '',
  '',
  'col-span-2 row-span-2',
  '',
  '',
  'col-span-2',
];

export function Tasi2026GallerySection() {
  return (
    <section
      id="gallery"
      className="bg-[#0d0b1f] py-section-sm text-white md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro eyebrow="In Pictures" title="Scenes from TASI 2026" dark>
          From the opening reception at the Goethe-Institut to the closing
          evening at the Netherlands Residence.
        </SectionIntro>
        <div className="mt-12 grid auto-rows-[140px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
          {tasi2026Gallery.map((photo, index) => (
            <div
              key={photo.src}
              className={`group relative overflow-hidden rounded-[10px] ${gallerySpans[index] || ''}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2026LookingAheadSection() {
  return (
    <section
      id="looking-ahead"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="What Comes Next"
          title="Looking Ahead to TASI 2027"
        >
          TASI returns in October 2027. These commitments and proposals from the
          2026 sessions point the way.
        </SectionIntro>
        <div className="mt-12 overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="grid gap-0 md:grid-cols-2">
            {tasi2026FuturePriorities.map((item, index) => (
              <article
                key={item}
                className="border-b border-stone-200 p-6 last:border-b-0 dark:border-slate-800 md:border-r md:p-8 md:last:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-rc-accent dark:text-white/70">
                  Next {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-stone-900 dark:text-white">
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
