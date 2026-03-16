import Link from "next/link";
import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import DarkHeroParticles from "@/components/ui/dark-hero-particles";

const themeCards = [
  {
    num: "01",
    title: "AI Governance and Regulatory Frameworks",
    desc: "Building ethical, accountable, and inclusive AI frameworks rooted in transparency, multi-stakeholder input, and global cooperation.",
    tag: "AI Policy",
    color: "bg-orange-700",
  },
  {
    num: "02",
    title: "Safety by Design and Platform Accountability",
    desc: "Embedding safety and accountability into technologies from the outset so platforms can prevent harm rather than only react to it.",
    tag: "Platform Governance",
    color: "bg-lime-700",
  },
  {
    num: "03",
    title: "Online Gender Based Violence and Digital Safety",
    desc: "Addressing TFGBV, image-based abuse, and digital coercive harm with survivor-centered policy and product approaches.",
    tag: "TFGBV",
    color: "bg-fuchsia-700",
  },
  {
    num: "04",
    title: "Fraud, Scams and Financial Exploitation",
    desc: "Combating digital fraud through cross-industry intelligence sharing, rapid response, and consumer-first protections.",
    tag: "Consumer Safety",
    color: "bg-red-700",
  },
  {
    num: "05",
    title: "Mental Health and Digital Wellbeing",
    desc: "Recognising moderation workforce stress and designing digital spaces that support healthy participation.",
    tag: "Wellbeing",
    color: "bg-cyan-700",
  },
  {
    num: "06",
    title: "AI for Inclusive Development",
    desc: "Contextualising AI for equitable access while reducing bias and exclusion across large-scale public systems.",
    tag: "Inclusion",
    color: "bg-amber-700",
  },
  {
    num: "07",
    title: "Global South Leadership in AI Governance",
    desc: "Positioning India and peer countries as rule-makers shaping global AI governance principles and models.",
    tag: "Global Policy",
    color: "bg-emerald-700",
  },
  {
    num: "08",
    title: "Cross Border Digital Harms and Cooperation",
    desc: "Tackling harms that cross borders with stronger legal coordination, data exchange, and operational partnerships.",
    tag: "International",
    color: "bg-pink-700",
  },
  {
    num: "09",
    title: "Transparency, Risk Assessment and Compliance",
    desc: "Moving beyond checkbox compliance through audit regimes, risk assessment, and meaningful platform transparency.",
    tag: "Compliance",
    color: "bg-indigo-700",
  },
];

export default function ThemesPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-orange-900 py-16 text-white md:py-24">
          <DarkHeroParticles />
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_right,_rgba(34,197,94,0.2),_transparent_35%),radial-gradient(circle_at_left,_rgba(251,146,60,0.18),_transparent_35%)]" />
          <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-2 md:px-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-300">Strategic Focus</p>
              <h1 className="mb-4 text-5xl font-black tracking-tight md:text-7xl">
                TASI 2026
                <span className="block text-orange-300">Themes</span>
              </h1>
              <p className="text-stone-200">
                TASI 2026 convenes leaders across government, industry, civil society, and academia to examine urgent questions shaping AI governance and digital trust.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <article className="rounded-xl border border-white/20 bg-white/10 p-4 text-center">
                <p className="text-4xl font-black">9</p>
                <p className="text-xs uppercase tracking-[0.12em] text-stone-300">Key Themes</p>
              </article>
              <article className="rounded-xl border border-white/20 bg-white/10 p-4 text-center">
                <p className="text-4xl font-black">50+</p>
                <p className="text-xs uppercase tracking-[0.12em] text-stone-300">Sessions</p>
              </article>
              <article className="rounded-xl border border-white/20 bg-white/10 p-4 text-center">
                <p className="text-4xl font-black">2</p>
                <p className="text-xs uppercase tracking-[0.12em] text-stone-300">Days</p>
              </article>
              <article className="rounded-xl border border-white/20 bg-white/10 p-4 text-center">
                <p className="text-4xl font-black">500+</p>
                <p className="text-xs uppercase tracking-[0.12em] text-stone-300">Participants</p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-stone-100 py-14 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">All Themes</p>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">What We&apos;ll Examine</h2>
            <p className="mb-8 max-w-3xl text-stone-700">
              Nine interconnected themes spanning policy, technology, and human impact, designed to move the conversation from dialogue to implementation.
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {themeCards.map((item) => (
                <article key={item.num} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`h-10 w-10 rounded-lg ${item.color}`} />
                    <span className="text-4xl font-black text-stone-200">{item.num}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-stone-900">{item.title}</h3>
                  <p className="mb-4 text-sm text-stone-700">{item.desc}</p>
                  <span className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">{item.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-stone-900 md:text-4xl">Be Part of the Conversation</h2>
            <Link href="/register" className="inline-flex rounded-md bg-orange-700 px-6 py-3 font-semibold text-white hover:bg-orange-800">
              Register for TASI 2026
            </Link>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
