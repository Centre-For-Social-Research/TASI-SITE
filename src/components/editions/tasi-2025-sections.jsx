import Image from 'next/image';

import KeynoteVideoPlayer from '@/components/editions/keynote-video-player';
import RadialOrbitalTimeline from '@/components/editions/radial-orbital-timeline';
import Tasi2025TrackIllustration from '@/components/editions/tasi-2025-track-illustration';
import {
  tasi2025FuturePriorities,
  tasi2025Impacts,
  tasi2025JourneyEditorialNotes,
  tasi2025JourneyTimeline,
  tasi2025KeynoteVideos,
  tasi2025MediaLinks,
  tasi2025Recommendations,
  tasi2025Tracks,
} from '@/data/tasi-2025-edition';

export function Tasi2025AboutSection() {
  return (
    <section
      id="about-festival"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg"
    >
      <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 px-4 md:grid-cols-[1.15fr_0.85fr] md:px-8 lg:px-16">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
            About the Festival
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3rem]">
            A First for India, A Milestone for the Global South
          </h2>
          <p className="mt-5 text-body-lg leading-relaxed text-stone-700 dark:text-slate-300">
            TASI 2025 created a multi-stakeholder platform for digital safety
            dialogue in India, bringing together government, international
            diplomats, technology companies, academics, and civil society under
            a shared responsibility framework.
          </p>
          <p className="mt-4 text-body-md leading-relaxed text-stone-600 dark:text-slate-400">
            The festival established a serious, practice-oriented space where
            Indian realities and Global South perspectives could shape the
            future of trust, safety, and AI governance.
          </p>
          <div className="mt-8 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 md:p-7">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-white">
              Perspective
            </p>
            <p className="text-lg leading-relaxed text-stone-800 dark:text-slate-100 md:text-xl">
              &quot;For the first time, voices from the Global South are shaping
              the future of digital trust with Indian insights and global
              relevance.&quot;
            </p>
            <p className="mt-5 text-sm font-medium text-stone-500 dark:text-slate-400">
              Caroline Humer, Co-Founder, Trust and Safety Festival
            </p>
          </div>
        </div>

        <article className="group overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-xl shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative aspect-[4/5] md:aspect-[4/4.4]">
            <Image
              src="/img/home-gallery/7T7A5102.webp"
              alt="TASI 2025 audience gathering during the festival in New Delhi"
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

export function Tasi2025JourneySection() {
  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] pb-section-sm md:pb-section-lg">
      <div className="mx-auto grid w-full max-w-[1300px] gap-8 px-4 md:grid-cols-[0.94fr_1.06fr] md:items-stretch md:px-8 lg:px-16">
        <div className="flex h-full flex-col justify-between pt-8 md:pt-10">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Festival Journey
          </p>
          <h2 className="max-w-2xl text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3rem]">
            The edition in one connected arc
          </h2>
          <p className="mt-5 max-w-lg text-body-lg leading-relaxed text-stone-700">
            TASI 2025 unfolded as a connected progression, from convening the
            right room in New Delhi to turning shared urgency into
            recommendations, institutional momentum, and the next chapter for
            TASI 2026.
          </p>
          <div className="mt-6 grid gap-3">
            {tasi2025JourneyEditorialNotes.map((note, index) => (
              <article
                key={note}
                className="rounded-[10px] border border-stone-200 bg-white/75 px-5 py-4 shadow-lg shadow-stone-200/30 backdrop-blur-sm"
              >
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-rc-primary">
                  Arc {String(index + 1).padStart(2, '0')}
                </p>
                <p className="text-sm leading-relaxed text-stone-700 md:text-[0.95rem]">
                  {note}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="relative flex h-full min-h-[28rem] overflow-hidden rounded-[10px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,241,232,0.82))] p-3 shadow-[0_24px_70px_rgba(120,92,70,0.12)] backdrop-blur-xl md:min-h-[30rem] md:overflow-visible md:p-4">
          <RadialOrbitalTimeline
            timelineData={tasi2025JourneyTimeline}
            variant="compact"
          />
        </div>
      </div>
    </section>
  );
}

export function Tasi2025KeynotesSection() {
  return (
    <section
      id="keynote-moments"
      className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white">
          Featured Session
        </p>
        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
          Keynote Addresses
        </h2>
        <p className="mt-4 max-w-2xl text-body-lg text-stone-600 dark:text-slate-300">
          Two landmark keynotes from TASI 2025 that shaped the global
          conversation on online safety and gender-based harm.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {tasi2025KeynoteVideos.map((video) => (
            <KeynoteVideoPlayer key={video.title} {...video} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2025TracksSection() {
  return (
    <section
      id="key-tracks"
      className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
          Thematic Focus
        </p>
        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
          Six Key Tracks
        </h2>
        <p className="mt-5 max-w-3xl text-body-lg text-stone-700 dark:text-slate-300">
          The inaugural edition spanned core trust and safety concerns across
          governance, product design, online harms, and institutional response.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tasi2025Tracks.map((track) => (
            <article
              key={track.title}
              className="rounded-[10px] border border-stone-200 bg-stone-50/70 p-7 shadow-lg shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-8"
            >
              <Tasi2025TrackIllustration variant={track.illustration} />
              <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                {track.title}
              </h3>
              <div className="mt-5 h-1 w-14 rounded-full bg-rc-accent dark:bg-white" />
              <p className="mt-5 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
                {track.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2025InauguralKeynoteSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm md:py-section-lg">
      <div className="mx-auto grid w-full max-w-[1300px] gap-10 px-4 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:px-8 lg:px-16">
        <article className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-orange-100/60 md:h-full">
          <a
            href="https://www.youtube.com/live/_s_16oiTqpI?si=vc0sW-zIJeGFnukv"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch Dr. S. Jaishankar's TASI 2025 keynote on YouTube"
            className="group block md:h-full"
          >
            <div className="relative aspect-[3/2] md:h-full md:min-h-[100%] md:aspect-auto">
              <Image
                src="/img/home-gallery/tasi-2025-jaishankar-keynote.png"
                alt="Dr. S. Jaishankar speaking at TASI 2025"
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-5 py-4 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100">
                Click to watch the video
              </div>
            </div>
          </a>
        </article>

        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Inaugural Keynote
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3rem]">
            India&apos;s Foreign Minister Opened the Festival
          </h2>
          <p className="mt-5 text-body-lg leading-relaxed text-stone-700">
            Dr. S. Jaishankar framed trust and safety as a strategic policy
            priority and emphasized human-guided AI governance with robust
            safeguards for digital citizens.
          </p>
          <div className="mt-8 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 md:p-7">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary">
              Key Message
            </p>
            <p className="text-xl leading-relaxed text-stone-900 md:text-2xl">
              &quot;Technology is a force for good, but only if humanity guides
              it.&quot;
            </p>
            <p className="mt-5 text-sm font-medium text-stone-500">
              Dr. S. Jaishankar, quoting PM Narendra Modi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Tasi2025ResearchSpotlightsSection() {
  return (
    <section className="bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-section-sm text-white md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white md:text-sm">
          Research and Data Spotlights
        </p>
        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem]">
          The Numbers Behind the Urgency
        </h2>
        <p className="mt-5 max-w-3xl text-body-lg text-white/80">
          The festival surfaced the scale of online harms and the need for
          faster, more accountable response systems.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tasi2025Impacts.map(([num, label]) => (
            <article
              key={label}
              className="rounded-[10px] border border-white/10 bg-white/[0.08] p-7 shadow-xl shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.14] md:p-8"
            >
              <p className="text-5xl font-black text-rc-secondary dark:text-white">
                {num}
              </p>
              <p className="mt-3 text-body-md leading-relaxed text-white/80">
                {label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tasi2025RecommendationsSection() {
  return (
    <section
      id="core-takeaways"
      className="bg-white py-section-sm md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
          Recommendations
        </p>
        <h2 className="max-w-4xl text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3.2rem]">
          Key Recommendations for India&apos;s Digital Future
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_100%)] p-8 text-white shadow-xl shadow-[#350265]/20 md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
              Strategic Direction
            </p>
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              From dialogue to implementation
            </h3>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              TASI 2025 surfaced a clear mandate: build stronger year-round
              collaboration, develop more practical governance frameworks, and
              center survivor-led, India-grounded trust and safety solutions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {tasi2025Recommendations.map((item, index) => (
              <article
                key={item}
                className="rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-6 shadow-lg shadow-stone-200/40 md:p-7"
              >
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-rc-primary">
                  Priority {String(index + 1).padStart(2, '0')}
                </p>
                <p className="text-body-md leading-relaxed text-stone-800">
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

export function Tasi2025LookingAheadSection() {
  return (
    <section
      id="looking-ahead"
      className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm md:py-section-lg"
    >
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
          What Comes Next
        </p>
        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3.2rem]">
          Looking Ahead to TASI 2026
        </h2>
        <div className="mt-12 overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-stone-200/40">
          <div className="grid gap-0 md:grid-cols-2">
            {tasi2025FuturePriorities.map((item, index) => (
              <article
                key={item}
                className="border-b border-stone-200 p-6 last:border-b-0 md:border-r md:p-8 md:last:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-rc-accent">
                  Next {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-stone-900">
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 md:p-8">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Media Coverage
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">
            Coverage Highlights
          </h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tasi2025MediaLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                className="rounded-[10px] border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
