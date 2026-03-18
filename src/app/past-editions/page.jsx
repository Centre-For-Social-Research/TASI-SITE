import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import { CardCarousel } from "@/components/ui/card-carousel";
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

const testimonialVideos = [
  {
    edition: "TASI 2025",
    speaker: "Norman Ng",
    title: "Head, Trust & Safety Global Engagement, Google",
    iframeSrc:
      "https://player.mux.com/hV7F001CojsQ5LIb4MmQ9yErlEJo02MCBQgRuHBtGFO1g?metadata-video-title=Norman+Ng+Head%2C+Trust+%26+Safety+Global+Engagement%2C+Google&video-title=Norman+Ng+Head%2C+Trust+%26+Safety+Global+Engagement%2C+Google",
    quote:
      "TASI created a rare space where policy, product, and civil society could align on practical digital safety outcomes.",
    placeholderSrc: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Shanley Clemot McLaren",
    title: "Feminist Activist and Global Expert on Gender Digital Rights, United Nations Young Activist",
    iframeSrc:
      "https://player.mux.com/jexDN2HQHJaA01hiMrVMPy3qFVh500XwwKzCuFGYctDuQ?metadata-video-title=Shanley+Clemot+McLaren%2C+Feminist+Activist+and+Global+Expert+on+Gender+Digital+Rights%2C+United+Nations+Young+Activist&video-title=Shanley+Clemot+McLaren%2C+Feminist+Activist+and+Global+Expert+on+Gender+Digital+Rights%2C+United+Nations+Young+Activist",
    quote:
      "The conversations moved beyond principles into implementation detail, which is exactly what this sector needs.",
    placeholderSrc: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Steven Biddle",
    title: "Minister Counsellor, Department of Home Affairs, Australian High Commission",
    iframeSrc:
      "https://player.mux.com/02JNh8oI36Cvd7rfnbZsKbGyiQHkORwAotHOEWPdvIio?metadata-video-title=Steven+Biddle+Minister+Counsellor%2C+Department+of+Home+Affairs%2C+Australian+High+Commission&video-title=Steven+Biddle+Minister+Counsellor%2C+Department+of+Home+Affairs%2C+Australian+High+Commission",
    quote:
      "From child protection to AI governance, the festival made inclusion and lived realities central to every session.",
    placeholderSrc: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Anshul Tewari",
    title: "Founder & CEO of Youth Ki Awaaz (YKA)",
    iframeSrc:
      "https://player.mux.com/TsAT02DJTa1enCe702C8501ja2wc1OboKk02msZ00v9uMjGc?metadata-video-title=Anshul+Tewari%2C+Founder+%26+CEO+of+Youth+Ki+Awaaz+%28YKA%29&video-title=Anshul+Tewari%2C+Founder+%26+CEO+of+Youth+Ki+Awaaz+%28YKA%29",
    quote:
      "This was one of the strongest examples of government, platforms, and civil society sharing one strategic roadmap.",
    placeholderSrc: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Dr. Samir Parikh",
    title: "Director, Department of Mental Health and Behavioral Sciences, Fortis Mental Health",
    iframeSrc:
      "https://player.mux.com/iFdSVuDlyvXU5TRHho7juL01rnuU02kEj00EzoPJKQy01zA?metadata-video-title=Dr.+Samir+Parikh%2C+Director%2C+Department+of+Mental+Health+and+Behavioral+Sciences%2C+Fortis+Mental+Health&video-title=Dr.+Samir+Parikh%2C+Director%2C+Department+of+Mental+Health+and+Behavioral+Sciences%2C+Fortis+Mental+Health",
    quote:
      "Building resilient digital communities requires mental health, safety, and policy to move in lockstep.",
    placeholderSrc: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Jeff Wu",
    title: "Co- Founder and Chief Safety Officer, K-ID",
    iframeSrc:
      "https://player.mux.com/G1oQyy6ZBEbVD01mfEJRVNgx6hDdnyzK4RgcamF02K6lM?metadata-video-title=Jeff+Wu%2C+Co-+Founder+and+Chief+Safety+Officer%2C+K-ID&video-title=Jeff+Wu%2C+Co-+Founder+and+Chief+Safety+Officer%2C+K-ID",
    quote:
      "Safety by design for younger users demands practical standards, shared accountability, and global collaboration.",
    placeholderSrc: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Nick Dale",
    title: "Director of Intelligence, Stop The Traffik",
    iframeSrc:
      "https://player.mux.com/sjqjmzcHZI2nQ5pPZgiiz9kQSLF501xq8NXsgm5Cqxyc?metadata-video-title=Nick+Dale%2C+Director+of+Intelligence%2C+Stop+The+Traffik&video-title=Nick+Dale%2C+Director+of+Intelligence%2C+Stop+The+Traffik",
    quote:
      "Intelligence-led collaboration is essential to disrupt online harm networks before they scale.",
    placeholderSrc: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Dylan Schouten",
    title: "Project Manager, GroSafe",
    iframeSrc:
      "https://player.mux.com/HxivRO9PT7N002KTYfgLMN2sr02K4ltyvYrOGmQL346X00?metadata-video-title=Dylan+Schouten%2C+Project+Manager%2C+GroSafe&video-title=Dylan+Schouten%2C+Project+Manager%2C+GroSafe",
    quote:
      "Operational safety improves when teams align evidence, prevention, and rapid response across partners.",
    placeholderSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Siddharth P.",
    title: "Co-Founder & Director, RATI Foundation",
    iframeSrc:
      "https://player.mux.com/FdIoj00Ax8kLMOP2mt01011jDkqAnIE023ptJHMp301QUkvU?metadata-video-title=Siddharth+P.+Co-Founder+%26+Director%2C+RATI+Foundation&video-title=Siddharth+P.+Co-Founder+%26+Director%2C+RATI+Foundation",
    quote:
      "Community-first safety efforts become sustainable when local organizations co-create solutions with policy and platform teams.",
    placeholderSrc: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Kriti Trehan",
    title: "Founder, Data & Co - Law & Policy Advisors",
    iframeSrc:
      "https://player.mux.com/pbmY02PKr4v2ZqLqYIXUb2fmllb7aisq023HhCEwj69kc?metadata-video-title=Kriti+Trehan%2C+Founder%2C+Data+%26+Co+-+Law+%26+Policy+Advisors&video-title=Kriti+Trehan%2C+Founder%2C+Data+%26+Co+-+Law+%26+Policy+Advisors",
    quote:
      "Strong trust and safety policy outcomes need legal clarity, rights-based design, and practical implementation pathways.",
    placeholderSrc: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Mitthat Hora",
    title: "Program Officer, British Asia Trust",
    iframeSrc:
      "https://player.mux.com/tESVh7p3mjj1NuII7tGP4ynKH01X0002IkZzDf2MmnDhLc?metadata-video-title=Mitthat+Hora%2C+Program+Officer%2C+British+Asia+Trust&video-title=Mitthat+Hora%2C+Program+Officer%2C+British+Asia+Trust",
    quote:
      "Partnership-led programming can turn trust and safety goals into measurable outcomes for vulnerable communities.",
    placeholderSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Neda Niazian",
    title: "Group Director Trust & Safety - Booking.com",
    iframeSrc:
      "https://player.mux.com/8NzFCG01Y5ipt2dbkNNyKtCZtMiJKhi001wDSt024eSdzs?metadata-video-title=Neda+Niazian%2C+Group+Director+Trust+%26+Safety+-+Booking.com&video-title=Neda+Niazian%2C+Group+Director+Trust+%26+Safety+-+Booking.com",
    quote:
      "Trust and safety maturity grows when organizations treat risk reduction, user trust, and business integrity as one strategy.",
    placeholderSrc: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Anupriya Kapur",
    title: "Digital Influencer and Life Coach",
    iframeSrc:
      "https://player.mux.com/BCVM8301H7Gy2WgR8AXuEzuIu500WSbjLJaZlXKgvKDwM?metadata-video-title=Anupriya+Kapur%2C+Digital+Influencer+and+Life+Coach&video-title=Anupriya+Kapur%2C+Digital+Influencer+and+Life+Coach",
    quote:
      "Digital well-being starts with awareness, empathy, and everyday choices that make online spaces safer for everyone.",
    placeholderSrc: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1280&q=80",
  },
  {
    edition: "TASI 2025",
    speaker: "Vaishnavi J",
    title: "Founder, Vys",
    iframeSrc:
      "https://player.mux.com/RORuDx4Jka8IefxJwkd8KF2YUP2uu01PV026CU02PwENSQ?metadata-video-title=Vaishnavi+J%2C+Founder%2C+Vys&video-title=Vaishnavi+J%2C+Founder%2C+Vys",
    quote:
      "Founder-led innovation can shape safer digital products when responsibility and user trust are built in from day one.",
    placeholderSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1280&q=80",
  },
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
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100">500+ Participants</span>
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
              <p className="text-sm text-stone-500">Caroline Humer, Co-Founder, Trust and Safety Festival</p>
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Testimonials</p>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Video Testimonials</h2>
            <p className="mb-8 max-w-3xl text-stone-700">
              These are placeholder cards for now. Once you share iframe links, each card will automatically render the embedded video in the same carousel.
            </p>
            <CardCarousel videos={testimonialVideos} showPagination showNavigation />
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