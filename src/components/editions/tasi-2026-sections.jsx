import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Tasi2026SpeakersWall from '@/components/editions/tasi-2026-speakers-wall';
import Tasi2025TrackIllustration from '@/components/editions/tasi-2025-track-illustration';
import { MotionReveal } from '@/components/ui/motion-reveal';
import {
  tasi2026ChiefGuest,
  tasi2026DayStories,
  tasi2026HighlightsVideoSrc,
  tasi2026Launches,
  tasi2026Quotes,
  tasi2026Recommendations,
} from '@/data/tasi-2026-edition';
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

export function Tasi2026HighlightsVideoSection() {
  return (
    <section
      id="festival-highlights"
      className="scroll-mt-24 bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] px-6 py-section-sm text-white md:py-section-md lg:px-16 lg:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px]">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
          <div className="flex-1 pr-0 lg:max-w-xl">
            <MotionReveal>
              <span className="mb-4 block text-xs font-black uppercase tracking-widest text-rc-secondary dark:text-white md:text-sm">
                Festival Highlights
              </span>
              <h2 className="mb-8 text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.2rem]">
                A Minute of{' '}
                <span className="text-rc-secondary dark:text-white">
                  TASI 2026
                </span>
              </h2>
              <div className="space-y-6 text-base font-normal leading-[1.6] text-white/90 md:text-[17px]">
                <p>
                  The people, conversations and connections behind two days of
                  trust and safety in New Delhi, on{' '}
                  <span className="font-bold text-white">
                    14-15 October 2026
                  </span>
                  .
                </p>
                <p>
                  Scenes from the festival, with remarks by Jitin Prasada on
                  human-centred technology and shared responsibility. English
                  captions are available in the player.
                </p>
                <p>
                  More than 500 delegates and 110 speakers filled the Main Hall,
                  the Workshop Room and the Roundtable Room across 55 sessions.
                  The film moves from the opening reception at the
                  Goethe-Institut, through panels on children, age assurance and
                  women&apos;s safety, to the report launch and the closing
                  evening at the Netherlands Residence.
                </p>
                <p>
                  Watch it for the faces and the conversations. The full
                  panel-by-panel coverage will follow on the TASI blog.
                </p>
              </div>
            </MotionReveal>
          </div>

          <div className="relative w-full flex-1">
            <MotionReveal delay={0.2} className="w-full">
              <div className="w-full overflow-hidden rounded-[10px] border border-white/5 bg-[#1b0d36] shadow-2xl">
                <div className="relative aspect-video w-full bg-black">
                  <video
                    className="absolute inset-0 h-full w-full"
                    controls
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    poster="/img/tasi-2026/highlights-poster.webp"
                    aria-label="TASI 2026 festival highlights"
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
                <div className="p-6 md:p-8">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-white/60 md:text-xs">
                    TASI 2026 Highlights
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">
                    Relive Two Days of TASI 2026 in New Delhi
                  </h3>
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>
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
  const quotes = tasi2026Quotes;

  return (
    <section
      id="voices"
      className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-orange-300 md:text-sm">
            Voices from TASI
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
            What Leaders Said
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            Messages from the ambassadors and diplomats who partnered with TASI
            2026.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((quote) => (
            <blockquote
              key={quote.author}
              className="flex h-full flex-col rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-7 text-stone-700 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] dark:text-slate-300 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-8"
            >
              <p className="flex-grow text-base leading-relaxed text-stone-800 dark:text-slate-200">
                &ldquo;{quote.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4 border-t border-stone-200 pt-6 dark:border-slate-700">
                <Avatar
                  name={quote.author}
                  photo={quote.photo}
                  size="h-16 w-16"
                />
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {quote.author}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-slate-400">
                    {quote.role}
                  </p>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2026DayStoriesSection() {
  return (
    <>
      {tasi2026DayStories.map((story, index) => {
        const reversed = index % 2 === 1;
        return (
          <section
            key={story.id}
            id={story.id}
            className={`scroll-mt-24 py-section-sm md:py-section-lg ${
              reversed
                ? 'bg-white dark:bg-stone-950'
                : 'bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)]'
            }`}
          >
            <div
              className={`mx-auto grid w-full max-w-[1300px] items-stretch gap-10 px-4 md:px-8 lg:px-16 ${
                reversed
                  ? 'md:grid-cols-[0.85fr_1.15fr]'
                  : 'md:grid-cols-[1.15fr_0.85fr]'
              }`}
            >
              <div className={reversed ? 'md:order-2' : undefined}>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
                  {story.eyebrow}
                </p>
                <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3rem]">
                  {story.title}
                </h2>
                <p className="mt-5 text-body-lg leading-relaxed text-stone-700 dark:text-slate-300">
                  {story.paragraphs[0]}
                </p>
                <p className="mt-4 text-body-md leading-relaxed text-stone-600 dark:text-slate-400">
                  {story.paragraphs[1]}
                </p>
                <div className="mt-8 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-7">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-white">
                    {story.cardTitle}
                  </p>
                  <ul className="space-y-2.5 text-base leading-relaxed text-stone-800 dark:text-slate-200">
                    {story.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rc-accent"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <article
                className={`group relative aspect-[4/3] overflow-hidden rounded-[10px] border border-stone-200 bg-stone-200 shadow-xl shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 md:aspect-auto md:min-h-[22rem] ${
                  reversed ? 'md:order-1' : ''
                }`}
              >
                <Image
                  src={story.image}
                  alt={story.imageAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
              </article>
            </div>
          </section>
        );
      })}
    </>
  );
}

export function Tasi2026ChiefGuestSection() {
  const guest = tasi2026ChiefGuest;
  return (
    <section
      id="chief-guest"
      className="scroll-mt-24 bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#0b1220_0%,#111827_100%)] md:py-section-lg"
    >
      <div className="mx-auto grid w-full max-w-[1300px] gap-10 px-4 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:px-8 lg:px-16">
        <article className="relative aspect-[4/3] overflow-hidden rounded-[10px] border border-stone-200 bg-stone-200 shadow-lg shadow-orange-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:aspect-auto md:min-h-[22rem]">
          <Image
            src={guest.photo}
            alt={guest.photoAlt}
            fill
            className="object-cover object-top"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </article>

        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
            Chief Guest
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3rem]">
            The Minister of State Opened the Festival
          </h2>
          <p className="mt-2 text-sm font-semibold text-stone-500 dark:text-slate-400">
            {guest.name}, {guest.role}
          </p>
          <p className="mt-5 text-body-lg leading-relaxed text-stone-700 dark:text-slate-300">
            {guest.summary}
          </p>
          <div className="mt-8 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-7">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-white">
              Key Message
            </p>
            <p className="text-xl leading-relaxed text-stone-900 dark:text-slate-100 md:text-2xl">
              &quot;{guest.quote}&quot;
            </p>
            <p className="mt-5 text-sm font-medium text-stone-500 dark:text-slate-400">
              {guest.name}, inaugural address, 14 October
            </p>
          </div>
          <Link
            href={guest.profileHref}
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold leading-none text-rc-primary underline decoration-[1.5px] underline-offset-4 dark:text-white"
          >
            Read his profile{' '}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Tasi2026ArticleSection() {
  return (
    <section
      id="full-coverage"
      className="scroll-mt-24 bg-white py-section-sm dark:bg-stone-950 md:py-section-md"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_100%)] p-8 text-white shadow-xl shadow-[#350265]/20 md:flex-row md:items-center md:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
              The Full Story
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Panel-by-panel coverage is coming to the blog
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              This page is the short version. We are writing up the panels,
              workshops and roundtables in a separate article on the TASI blog.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#140f26] transition hover:scale-[1.02] hover:bg-white/90"
          >
            Visit the blog <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Tasi2026SpeakersWallSection() {
  return <Tasi2026SpeakersWall />;
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
