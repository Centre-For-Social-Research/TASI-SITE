import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Tasi2025TrackIllustration from '@/components/editions/tasi-2025-track-illustration';
import { MotionReveal } from '@/components/ui/motion-reveal';
import { programmeSessions2026 } from '@/data/programme-2026';
import {
  tasi2026Gallery,
  tasi2026HighlightsVideoSrc,
  tasi2026Ideas,
  tasi2026Launches,
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
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionIntro
            eyebrow="The Festival Film"
            title="A Minute of TASI 2026"
            dark
          >
            The people, conversations and connections behind two days of trust
            and safety.
          </SectionIntro>
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
            New Delhi · October 2026
          </p>
        </div>
        <div className="overflow-hidden rounded-[10px] border border-white/15 bg-black shadow-2xl shadow-black/30">
          <video
            className="aspect-video w-full"
            controls
            playsInline
            preload="none"
            poster="/img/tasi-2026/highlights-poster.webp"
            aria-label="TASI 2026 festival highlights"
            aria-describedby="highlights-description"
            width="1280"
            height="720"
          >
            <source src={tasi2026HighlightsVideoSrc} type="video/mp4" />
            <track
              kind="captions"
              src="/video/tasi-2026-highlights-v3.en.vtt"
              srcLang="en"
              label="English"
            />
            Your browser does not support video playback.{' '}
            <a href={tasi2026HighlightsVideoSrc}>
              Download the TASI 2026 highlights.
            </a>
          </video>
        </div>
        <p
          id="highlights-description"
          className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65"
        >
          Scenes from the festival, with remarks by Jitin Prasada on
          human-centred technology and shared responsibility. English captions
          available in the player.
        </p>
      </div>
    </section>
  );
}

function IdeaChapter({ idea, featured = false }) {
  return (
    <article
      className={`overflow-hidden rounded-[10px] border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${featured ? 'md:col-span-2 lg:grid lg:grid-cols-2' : ''}`}
    >
      <div
        className={`relative ${featured ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[400px]' : 'aspect-[16/9]'}`}
      >
        <Image
          src={idea.image}
          alt={idea.imageAlt}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        <span className="absolute bottom-4 left-4 rounded-[10px] bg-rc-primary px-3 py-2 text-sm font-black text-white">
          Idea {idea.number}
        </span>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-3xl">
          {idea.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-slate-300">
          {idea.body}
        </p>
        <div className="mt-5 border-l-2 border-rc-accent pl-4">
          <p className="text-3xl font-black text-rc-primary dark:text-rc-secondary">
            {idea.stat.value}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-slate-200">
            {idea.stat.label}
          </p>
          <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
            Cited by {idea.stat.source}
          </p>
        </div>
        <details className="mt-6 border-t border-stone-200 pt-4 dark:border-slate-700">
          <summary className="cursor-pointer text-sm font-bold text-rc-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-white">
            The voices and sessions behind this idea
          </summary>
          <blockquote className="mt-5">
            <p className="text-base leading-relaxed text-stone-800 dark:text-slate-200">
              &ldquo;{idea.quote.text}&rdquo;
            </p>
            <cite className="mt-3 block text-sm not-italic text-stone-500 dark:text-slate-400">
              {idea.quote.author}, {idea.quote.role}
            </cite>
          </blockquote>
          <ul className="mt-4 space-y-3">
            {idea.sessions
              .map((id) => sessionsById.get(id))
              .filter(Boolean)
              .map((session) => (
                <li key={session.id}>
                  <Link
                    href={getProgrammeSessionPath(session)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-rc-primary underline underline-offset-4 dark:text-white"
                  >
                    {shortSessionTitle(session.title)}
                    <ArrowRight
                      className="h-3 w-3 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
          </ul>
        </details>
      </div>
    </article>
  );
}

export function Tasi2026IdeasSection() {
  return (
    <section
      id="five-ideas"
      className="scroll-mt-24 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#0b1220_0%,#111827_100%)] md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="What We Heard"
          title="Five Things TASI 2026 Made Clear"
        >
          Five themes from the discussions: whose safety matters, where
          responsibility sits, and what needs to change.
        </SectionIntro>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tasi2026Ideas.map((idea, index) => (
            <IdeaChapter key={idea.number} idea={idea} featured={index === 0} />
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
      className="scroll-mt-24 bg-white py-section-sm dark:bg-stone-950 md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro
          eyebrow="New at the Festival"
          title="Introduced at TASI 2026"
        >
          Reports, resources and initiatives shared or announced during the
          festival.
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

function SessionRecapCard({ recap: { summary, session } }) {
  return (
    <Link
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
        Session page <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
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
            title="Explore the Conversations"
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
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recaps.slice(0, 6).map((recap) => (
            <SessionRecapCard key={recap.id} recap={recap} />
          ))}
        </div>
        <details className="mt-8 rounded-[10px] border border-stone-200 p-6 dark:border-slate-800">
          <summary className="cursor-pointer text-base font-bold text-rc-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-white">
            Explore six more session highlights
          </summary>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recaps.slice(6).map((recap) => (
              <SessionRecapCard key={recap.id} recap={recap} />
            ))}
          </div>
        </details>
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
              Recommendations heard across sessions on 14 and 15 October, with
              calls for policymakers, platforms and civil society to turn ideas
              into practical change.
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
  'md:col-span-2 md:row-span-2',
  '',
  '',
  'md:col-span-2',
  '',
  '',
  'md:col-span-2 md:row-span-2',
  '',
  '',
  'md:col-span-2',
];

export function Tasi2026GallerySection() {
  return (
    <section
      id="gallery"
      className="scroll-mt-24 bg-[#0d0b1f] py-section-sm text-white md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <SectionIntro eyebrow="In Pictures" title="Scenes from TASI 2026" dark>
          From the opening reception at the Goethe-Institut to the closing
          evening at the Netherlands Residence.
        </SectionIntro>
        <div className="mt-10 grid auto-rows-[180px] grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
          {tasi2026Gallery.map((photo, index) => (
            <figure
              key={photo.src}
              className={`group relative overflow-hidden rounded-[10px] ${gallerySpans[index] || ''}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, (min-width: 640px) 50vw, 100vw"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8 text-xs leading-relaxed text-white">
                {photo.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2026GetInvolvedSection() {
  return (
    <section
      id="get-involved"
      className="scroll-mt-24 border-t border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] px-4 py-section-sm dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
          The Conversation Continues
        </p>
        <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl">
          Help Shape What Comes Next
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-stone-600 dark:text-slate-300">
          TASI 2026 brought our community together. Keep the work moving:
          contribute your expertise, connect with the community, or partner with
          us to put people first in digital safety.
        </p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link
            href="/get-involved"
            className="flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-2.5 text-[16px] font-bold leading-6 text-white transition-transform hover:scale-[1.02] hover:opacity-90 sm:w-auto sm:min-w-[220px]"
          >
            Get Involved
          </Link>
          <Link
            href="/sponsor"
            className="flex w-full items-center justify-center rounded-3xl bg-rc-primary px-8 py-2.5 text-[16px] font-bold leading-6 text-rc-primary-foreground transition-transform hover:scale-[1.02] hover:opacity-90 dark:bg-white dark:text-slate-950 sm:w-auto sm:min-w-[220px]"
          >
            Partner with us
          </Link>
        </div>
      </div>
    </section>
  );
}
