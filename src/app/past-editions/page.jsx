import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";

const tracks = [
  [
    "AI Governance and Safety",
    "Building ethical, accountable, and inclusive AI frameworks rooted in transparency and global cooperation.",
  ],
  [
    "Child Protection",
    "Designing safer digital environments with privacy-first defaults, age-appropriate design, and abuse prevention.",
  ],
  [
    "Youth Wellbeing",
    "Supporting healthy youth participation online while balancing autonomy, agency, and safety.",
  ],
  [
    "Gendered and Sexualized Harms",
    "Addressing TFGBV, image-based abuse, and emerging AI-enabled exploitation.",
  ],
  [
    "Trust and Safety Workforce",
    "Recognizing emotional labor in moderation and advancing care-by-design practices.",
  ],
  [
    "Safety by Design",
    "Embedding safety, transparency, and accountability from product and model inception.",
  ],
  [
    "Platform Responsibility and Collaboration",
    "Cross-sector cooperation among government, industry, and civil society to address online harms.",
  ],
];

const sessions = [
  ["DAY 1 · 09:15", "From Paris to Delhi: Shaping Global AI Governance and Ethical Innovation", "AI Governance"],
  ["DAY 1 · 11:00", "AI for Safety: Balancing Technology and Human Judgment", "AI Safety"],
  ["DAY 1 · 12:00", "Protecting Children Online", "Child Safety"],
  ["DAY 1 · 14:15", "CTRL + SHIFT + RESPECT: Building Safer Digital Spaces for Girls", "TFGBV"],
  ["DAY 1 · 15:15", "Click to Protect: How Digital Platforms Can Disrupt Human Trafficking Networks", "Trafficking"],
  ["DAY 2 · 10:30", "Designing for Youth: Privacy, Protection, and Participation in the Digital Age", "Youth Design"],
  ["DAY 2 · 12:15", "Child Influencers in the Creator Economy", "Creator Economy"],
  ["DAY 2 · 15:40", "Well-being for Trust and Safety Workers", "Workforce Wellbeing"],
];

const impacts = [
  ["90%+", "TFGBV Data Unreported"],
  ["30%", "Children Talking with Strangers Online"],
  ["25%", "LGBTQ+ TFGBV Survivors at Risk"],
  ["10 Days+", "Platform Response Times for Child Safety"],
  ["1,500+", "Content Takedowns via Meri Trust Line"],
  ["$20B+", "Meta's Investment in Online Safety"],
];

const recommendations = [
  "Deepen civil society-led collaboration as a catalyst for innovation.",
  "Move from compliance to co-design through structured working forums.",
  "Expand participation beyond traditional platforms into telecom, fintech, gaming, and edtech.",
  "Prioritize India-first innovation for global relevance.",
  "Develop coordinated AI governance frameworks with practical implementation tracks.",
  "Establish year-round engagement structures, not just annual conversations.",
  "Embed survivor-centered design in reporting and redress architecture.",
  "Institutionalize care by design for trust and safety workers.",
];

const future = [
  "Stronger Global South leadership",
  "Trust and Safety Index for measurable progress",
  "Regional and state-level dialogues across India",
  "Implementation clinics and innovation showcases",
  "Broader cross-industry participation",
];

export default function PastEditionsPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-14 dark:bg-[radial-gradient(circle_at_25%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)] md:py-20">
          <DarkHeroParticles />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-300">Past Editions</p>
            <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-slate-100 md:text-6xl">
              TASI 2025
              <span className="block text-orange-700 dark:text-cyan-200">Trust and Safety India Festival</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-stone-700 dark:text-slate-200">
              A landmark two-day convening in New Delhi that brought together government leaders, global technology platforms, diplomats, researchers, and civil society to reimagine safer digital ecosystems.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100">October 7-8, 2025</span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100">The Ambassador Hotel, New Delhi</span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100">350+ Participants</span>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
            <article className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">About the Festival</p>
              <h2 className="mb-3 text-3xl font-black tracking-tight text-stone-900">A First for India, A Milestone for the Global South</h2>
              <p className="text-stone-700">
                TASI 2025 created a multi-stakeholder platform for digital safety dialogue in India, bringing together government, international diplomats, technology companies, academics, and civil society under a shared responsibility framework.
              </p>
            </article>
            <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
              <blockquote className="mb-4 text-stone-700">
                "For the first time, voices from the Global South are shaping the future of digital trust with Indian insights and global relevance."
              </blockquote>
              <p className="text-sm text-stone-500">Caroline Humer, Co-Founder, Trust and Safety Forum</p>
            </article>
          </div>
        </section>

        <section className="bg-stone-100 py-14 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Thematic Focus</p>
            <h2 className="mb-8 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Seven Key Tracks</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tracks.map(([title, desc]) => (
                <article key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
                  <h3 className="mb-2 text-lg font-bold text-stone-900">{title}</h3>
                  <p className="text-sm text-stone-700">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
            <article className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Inaugural Keynote</p>
              <h2 className="mb-3 text-3xl font-black tracking-tight text-stone-900">India's Foreign Minister Opened the Festival</h2>
              <p className="text-stone-700">
                Dr. S. Jaishankar framed trust and safety as a strategic policy priority and emphasized human-guided AI governance with robust safeguards for digital citizens.
              </p>
            </article>
            <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
              <p className="mb-3 text-lg italic text-stone-800">"Technology is a force for good, but only if humanity guides it."</p>
              <p className="text-sm text-stone-600">Dr. S. Jaishankar, quoting PM Narendra Modi</p>
            </article>
          </div>
        </section>

        <section className="bg-stone-100 py-14 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Programming</p>
            <h2 className="mb-8 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Expert Panels and Key Sessions</h2>
            <div className="grid gap-3">
              {sessions.map(([time, title, tag]) => (
                <article key={`${time}-${title}`} className="rounded-xl border border-stone-200 bg-white p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{time}</p>
                  <h3 className="mb-2 text-base font-bold text-stone-900 md:text-lg">{title}</h3>
                  <span className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">{tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-green-900 py-14 text-white md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-200">Research and Data Spotlights</p>
            <h2 className="mb-8 text-3xl font-black tracking-tight md:text-5xl">The Numbers Behind the Urgency</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {impacts.map(([num, label]) => (
                <article key={label} className="rounded-2xl border border-green-700 bg-green-800 p-5">
                  <p className="text-4xl font-black">{num}</p>
                  <p className="mt-1 text-sm text-green-100">{label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Workshops</p>
            <h2 className="mb-8 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Immersive Sessions</h2>
            <p className="max-w-4xl text-stone-700">
              TASI 2025 workshops covered AI child-protection tooling, strategic foresight, intergenerational online safety dialogue, youth-led civic safety mapping, regulatory sandboxing, and responsible creator practices.
            </p>
          </div>
        </section>

        <section className="bg-stone-100 py-14 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Recommendations</p>
            <h2 className="mb-8 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Key Recommendations for India's Digital Future</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {recommendations.map((item, index) => (
                <article key={item} className="rounded-xl border border-stone-200 bg-white p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">REC {String(index + 1).padStart(2, "0")}</p>
                  <p className="text-stone-800">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">What Comes Next</p>
            <h2 className="mb-8 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Looking Ahead to TASI 2026</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {future.map((item) => (
                <article key={item} className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-stone-800">
                  {item}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}