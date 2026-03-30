import Image from 'next/image';
import AboutQuotes from '@/components/about/quotes';
import HomeFooter from '@/components/home/footer';
import GlobalCta from '@/components/home/global-cta';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';

const tracks = [
  [
    'AI Governance and Safety',
    'Building ethical, accountable, and inclusive AI frameworks rooted in transparency and global cooperation.',
  ],
  [
    'Child Protection',
    'Designing safer digital environments with privacy-first defaults, age-appropriate design, and abuse prevention.',
  ],
  [
    'Gendered and Sexualized Harms',
    'Addressing TFGBV, image-based abuse, and emerging AI-enabled exploitation.',
  ],
  [
    'Trust and Safety Workforce',
    'Recognizing emotional labor in moderation and advancing care-by-design practices.',
  ],
  [
    'Safety by Design',
    'Embedding safety, transparency, and accountability from product and model inception.',
  ],
  [
    'Platform Responsibility and Collaboration',
    'Cross-sector cooperation among government, industry, and civil society to address online harms.',
  ],
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

        <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
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

        <section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg">
          <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
              Thematic Focus
            </p>
            <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
              Seven Key Tracks
            </h2>
            <p className="mt-5 max-w-3xl text-body-lg text-stone-700 dark:text-slate-300">
              The inaugural edition spanned core trust and safety concerns
              across governance, product design, online harms, and institutional
              response.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tracks.map(([title, desc]) => (
                <article
                  key={title}
                  className="rounded-[10px] border border-stone-200 bg-stone-50/70 p-7 shadow-lg shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-8"
                >
                  <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                    {title}
                  </h3>
                  <div className="mt-5 h-1 w-14 rounded-full bg-rc-accent dark:bg-white"></div>
                  <p className="mt-5 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
                    {desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm md:py-section-lg">
          <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 px-4 md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-16">
            <article className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-orange-100/60">
              <div className="relative aspect-[4/5] md:aspect-[4/4.5]">
                <Image
                  src="/img/home-gallery/7T7A0651.webp"
                  alt="Dr. S. Jaishankar speaking at TASI 2025"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
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

        <section className="bg-white py-section-sm md:py-section-lg">
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

        <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm md:py-section-lg">
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
      <HomeFooter />
    </>
  );
}
