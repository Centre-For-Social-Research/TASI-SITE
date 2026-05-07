import Image from 'next/image';
import KeynoteVideoPlayer from '@/components/editions/keynote-video-player';
import RadialOrbitalTimeline from '@/components/editions/radial-orbital-timeline';
import AboutQuotes from '@/components/about/quotes';
import GlobalCta from '@/components/home/global-cta';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';

const tracks = [
  {
    title: 'AI Governance and Safety',
    description:
      'Building ethical, accountable, and inclusive AI frameworks rooted in transparency and global cooperation.',
    illustrationVariant: 'accent',
    illustration: 'orbit',
  },
  {
    title: 'Child Protection',
    description:
      'Designing safer digital environments with privacy-first defaults, age-appropriate design, and abuse prevention.',
    illustrationVariant: 'accent',
    illustration: 'shield',
  },
  {
    title: 'Gendered and Sexualized Harms',
    description:
      'Addressing TFGBV, image-based abuse, and emerging AI-enabled exploitation.',
    illustrationVariant: 'accent',
    illustration: 'signal',
  },
  {
    title: 'Trust and Safety Workforce',
    description:
      'Recognizing emotional labor in moderation and advancing care-by-design practices.',
    illustrationVariant: 'accent',
    illustration: 'support',
  },
  {
    title: 'Safety by Design',
    description:
      'Embedding safety, transparency, and accountability from product and model inception.',
    illustrationVariant: 'accent',
    illustration: 'foundation',
  },
  {
    title: 'Platform Responsibility and Collaboration',
    description:
      'Cross-sector cooperation among government, industry, and civil society to address online harms.',
    illustrationVariant: 'accent',
    illustration: 'network',
  },
];

const impacts = [
  ['90%+', 'TFGBV Data Unreported'],
  ['30%', 'Children Talking with Strangers Online'],
  ['25%', 'LGBTQ+ TFGBV Survivors at Risk'],
  ['10 Days+', 'Platform Response Times for Child Safety'],
  ['1,500+', 'Content Takedowns via Meri Trust Line'],
  ['$20B+', "Meta's Investment in Online Safety"],
];

const recommendations = [
  'Deepen civil society-led collaboration as a catalyst for innovation.',
  'Move from compliance to co-design through structured working forums.',
  'Expand participation beyond traditional platforms into telecom, fintech, gaming, and edtech.',
  'Prioritize India-first innovation for global relevance.',
  'Develop coordinated AI governance frameworks with practical implementation tracks.',
  'Establish year-round engagement structures, not just annual conversations.',
  'Embed survivor-centered design in reporting and redress architecture.',
  'Institutionalize care by design for trust and safety workers.',
];

const future = [
  'Stronger Global South leadership',
  'Trust and Safety Index for measurable progress',
  'Regional and state-level dialogues across India',
  'Broader cross-industry participation',
];

const festivalJourneyEditorialNotes = [
  'A compact map of how TASI 2025 moved from convening to policy direction.',
  'Each stop links the edition’s momentum to the wider TASI 2026 conversation.',
];

const festivalJourneyTimeline = [
  {
    id: 1,
    title: 'Opening Convening',
    date: 'Stop 01',
    content:
      'TASI 2025 opened as a landmark convening in New Delhi, bringing together government, diplomats, platforms, researchers, and civil society around a shared trust and safety agenda.',
    category: 'arrival',
    icon: 'arrival',
    relatedIds: [2, 3],
    status: 'completed',
    energy: 88,
  },
  {
    id: 2,
    title: 'Keynote Moments',
    date: 'Stop 02',
    content:
      'Ministerial and global keynote voices framed the festival with urgency, strategic policy context, and a human-guided vision for safer digital ecosystems.',
    category: 'keynotes',
    icon: 'keynotes',
    relatedIds: [1, 3, 4],
    status: 'completed',
    energy: 94,
  },
  {
    id: 3,
    title: 'Six Key Tracks',
    date: 'Stop 03',
    content:
      'The festival moved into six connected thematic tracks covering AI governance, child protection, gendered harms, workforce realities, safety by design, and platform collaboration.',
    category: 'tracks',
    icon: 'tracks',
    relatedIds: [1, 2, 4],
    status: 'completed',
    energy: 90,
  },
  {
    id: 4,
    title: 'Core Takeaways',
    date: 'Stop 04',
    content:
      'Research findings, policy discussions, and implementation-focused recommendations translated the event into practical priorities for India’s digital future.',
    category: 'takeaways',
    icon: 'takeaways',
    relatedIds: [2, 3, 5],
    status: 'completed',
    energy: 86,
  },
  {
    id: 5,
    title: 'TASI 2026',
    date: 'Stop 05',
    content:
      'The inaugural edition closed with a forward path for stronger Global South leadership, year-round engagement, and a more ambitious TASI 2026.',
    category: 'future',
    icon: 'future',
    relatedIds: [4],
    status: 'in-progress',
    energy: 82,
  },
];

function TrackIllustration({ track }) {
  const isSubtle = track.illustrationVariant === 'subtle';
  const shellClasses = isSubtle
    ? 'border-stone-200/80 bg-[linear-gradient(135deg,rgba(245,245,244,0.96),rgba(255,255,255,0.92))] dark:border-slate-700 dark:bg-[linear-gradient(135deg,rgba(26,26,26,0.92),rgba(15,23,42,0.78))]'
    : 'border-transparent bg-[linear-gradient(135deg,rgba(53,2,101,0.92),rgba(92,15,79,0.88),rgba(255,105,0,0.78))] shadow-lg shadow-[#5c0f4f]/20 dark:shadow-[#15002b]/40';
  const illustrationTone = isSubtle
    ? 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(244,244,245,0.72)_42%,rgba(231,229,228,0.56)_100%)]'
    : 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),rgba(255,255,255,0.12)_36%,rgba(17,24,39,0)_100%)]';
  const strokeTone = isSubtle ? 'border-stone-400/75' : 'border-white/60';
  const glowTone = isSubtle ? 'bg-stone-300/55' : 'bg-white/25';
  const accentFill = isSubtle
    ? 'bg-stone-500/14'
    : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,217,25,0.3),rgba(255,105,0,0.28))]';

  const patterns = {
    orbit: (
      <>
        <div className={`absolute inset-6 rounded-full border ${strokeTone}`} />
        <div
          className={`absolute inset-x-10 top-3 h-12 rounded-full border ${strokeTone}`}
        />
        <div
          className={`absolute inset-y-4 right-10 w-12 rounded-full border ${strokeTone}`}
        />
        <div
          className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute right-10 top-7 h-3 w-3 rounded-full ${glowTone}`}
        />
      </>
    ),
    shield: (
      <>
        <div
          className={`absolute left-1/2 top-5 h-16 w-16 -translate-x-1/2 rounded-[10px] border ${strokeTone} ${accentFill}`}
        />
        <div
          className={`absolute left-1/2 top-10 h-9 w-9 -translate-x-1/2 rotate-45 rounded-[10px] border ${strokeTone}`}
        />
        <div
          className={`absolute left-1/2 top-[4.7rem] h-3 w-10 -translate-x-1/2 rounded-full ${glowTone}`}
        />
      </>
    ),
    signal: (
      <>
        <div
          className={`absolute left-8 top-8 h-12 w-12 rounded-full border ${strokeTone}`}
        />
        <div
          className={`absolute left-14 top-14 h-12 w-12 rounded-full border ${strokeTone}`}
        />
        <div
          className={`absolute left-20 top-20 h-12 w-12 rounded-full border ${strokeTone}`}
        />
        <div
          className={`absolute right-10 top-10 h-4 w-4 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute right-16 bottom-8 h-10 w-24 rounded-full ${accentFill}`}
        />
      </>
    ),
    support: (
      <>
        <div
          className={`absolute left-7 top-8 h-12 w-12 rounded-full ${accentFill}`}
        />
        <div
          className={`absolute right-8 top-8 h-12 w-12 rounded-full ${accentFill}`}
        />
        <div
          className={`absolute left-12 top-16 h-14 w-16 rotate-[-12deg] rounded-[10px] border ${strokeTone}`}
        />
        <div
          className={`absolute right-12 top-16 h-14 w-16 rotate-[12deg] rounded-[10px] border ${strokeTone}`}
        />
        <div
          className={`absolute left-1/2 top-[4.6rem] h-3 w-20 -translate-x-1/2 rounded-full ${glowTone}`}
        />
      </>
    ),
    foundation: (
      <>
        <div
          className={`absolute left-10 top-7 h-14 w-14 rounded-[10px] border ${strokeTone}`}
        />
        <div
          className={`absolute left-[5.4rem] top-12 h-14 w-14 rounded-[10px] border ${strokeTone}`}
        />
        <div
          className={`absolute right-10 top-7 h-14 w-14 rounded-[10px] border ${strokeTone}`}
        />
        <div
          className={`absolute left-1/2 bottom-7 h-3 w-28 -translate-x-1/2 rounded-full ${glowTone}`}
        />
      </>
    ),
    network: (
      <>
        <div
          className={`absolute left-10 top-9 h-4 w-4 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute left-1/2 top-5 h-5 w-5 -translate-x-1/2 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute right-10 top-10 h-4 w-4 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute left-[4.4rem] bottom-8 h-4 w-4 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute right-[4.4rem] bottom-8 h-4 w-4 rounded-full ${glowTone}`}
        />
        <div
          className={`absolute left-[4.9rem] top-11 h-px w-24 rotate-[14deg] ${accentFill}`}
        />
        <div
          className={`absolute left-1/2 top-8 h-16 w-px -translate-x-1/2 ${accentFill}`}
        />
        <div
          className={`absolute right-[4.9rem] top-11 h-px w-24 -rotate-[14deg] ${accentFill}`}
        />
        <div
          className={`absolute left-[5.2rem] bottom-10 h-px w-24 ${accentFill}`}
        />
      </>
    ),
  };

  return (
    <div className={`mb-6 rounded-[10px] border p-4 ${shellClasses}`}>
      <div
        className={`cardIllustration relative h-28 overflow-hidden rounded-[10px] ${illustrationTone}`}
      >
        <div className="absolute inset-0 opacity-90">
          {patterns[track.illustration]}
        </div>
        <div
          className={`absolute inset-x-6 bottom-4 h-px ${isSubtle ? 'bg-stone-300/80' : 'bg-white/30'}`}
        />
      </div>
    </div>
  );
}

export default function Tasi2025Page() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero>
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/75">
              TASI Editions
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2025
              <span className="mt-2 block text-[1.15rem] font-extrabold text-rc-secondary dark:text-white md:text-[1.85rem]">
                Trust and Safety India Festival
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              A landmark two-day convening in New Delhi that brought together
              government leaders, global technology platforms, diplomats,
              researchers, and civil society to reimagine safer digital
              ecosystems.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                October 7-8, 2025
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                The Ambassador Hotel, New Delhi
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                500+ Participants
              </span>
            </div>
            <div className="mt-7">
              <a
                href="https://drive.google.com/file/d/1S9dHlHQg8pm0-HjsjkXK0dwOSUCYqhxn/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full !bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] !text-[#140f26] transition hover:scale-[1.02] hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26]"
              >
                Read TASI 2025 Report
              </a>
            </div>
          </div>
        </BrandedPageHero>

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
                TASI 2025 created a multi-stakeholder platform for digital
                safety dialogue in India, bringing together government,
                international diplomats, technology companies, academics, and
                civil society under a shared responsibility framework.
              </p>
              <p className="mt-4 text-body-md leading-relaxed text-stone-600 dark:text-slate-400">
                The festival established a serious, practice-oriented space
                where Indian realities and Global South perspectives could shape
                the future of trust, safety, and AI governance.
              </p>
              <div className="mt-8 rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 md:p-7">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-white">
                  Perspective
                </p>
                <p className="text-lg leading-relaxed text-stone-800 dark:text-slate-100 md:text-xl">
                  &quot;For the first time, voices from the Global South are
                  shaping the future of digital trust with Indian insights and
                  global relevance.&quot;
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
                  className="object-cover scale-[1.05] transition duration-500 group-hover:scale-[1.08]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
            </article>
          </div>
        </section>

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
                TASI 2025 unfolded as a connected progression, from convening
                the right room in New Delhi to turning shared urgency into
                recommendations, institutional momentum, and the next chapter
                for TASI 2026.
              </p>
              <div className="mt-6 grid gap-3">
                {festivalJourneyEditorialNotes.map((note, index) => (
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
                timelineData={festivalJourneyTimeline}
                variant="compact"
              />
            </div>
          </div>
        </section>

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
              <KeynoteVideoPlayer
                iframeSrc="https://player.mux.com/k100u1ANRTgJCpEhVqJBpNxdREzMvhQWs1mE6IlSGeTE?metadata-video-title=Julie+Inman+Grant&video-title=Julie+Inman+Grant"
                title="Safety by Design in the Age of AI"
                speaker="Julie Inman Grant"
                role="eSafety Commissioner, Australia"
              />
              <KeynoteVideoPlayer
                iframeSrc="https://player.mux.com/l6f94UXaZxMGhwpwVNhzI61C02uYEexTJH02REw1i024Os?metadata-video-title=DELPHINE+O&video-title=DELPHINE+O"
                title="Combating Tech-Facilitated Gender-Based Violence"
                speaker="Delphine O"
                role="Ambassador-at-Large, Generation Equality Forum"
              />
            </div>
          </div>
        </section>

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
              The inaugural edition spanned core trust and safety concerns
              across governance, product design, online harms, and institutional
              response.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tracks.map((track) => (
                <article
                  key={track.title}
                  className="rounded-[10px] border border-stone-200 bg-stone-50/70 p-7 shadow-lg shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-8"
                >
                  <TrackIllustration track={track} />
                  <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                    {track.title}
                  </h3>
                  <div className="mt-5 h-1 w-14 rounded-full bg-rc-accent dark:bg-white"></div>
                  <p className="mt-5 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
                    {track.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm md:py-section-lg">
          <div className="mx-auto grid w-full max-w-[1300px] gap-10 px-4 md:items-stretch md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-16">
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
                  &quot;Technology is a force for good, but only if humanity
                  guides it.&quot;
                </p>
                <p className="mt-5 text-sm font-medium text-stone-500">
                  Dr. S. Jaishankar, quoting PM Narendra Modi
                </p>
              </div>
            </div>
          </div>
        </section>

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
              {impacts.map(([num, label]) => (
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
                  collaboration, develop more practical governance frameworks,
                  and center survivor-led, India-grounded trust and safety
                  solutions.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {recommendations.map((item, index) => (
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

        <AboutQuotes />

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
                {future.map((item, index) => (
                  <article
                    key={item}
                    className="border-b border-stone-200 p-6 last:border-b-0 md:border-r md:last:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:p-8"
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
                <a
                  href="/downloads/tasi-2025-media-coverage-dossier.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[10px] border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white"
                >
                  Open Media Dossier
                </a>
                <a
                  href="/downloads/tasi-2025-media-coverage-report.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[10px] border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white"
                >
                  Open Media Coverage Report
                </a>
                <a
                  href="/media"
                  className="rounded-[10px] border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white"
                >
                  View Media Page
                </a>
              </div>
            </div>
          </div>
        </section>

        <GlobalCta />
      </main>
    </>
  );
}
