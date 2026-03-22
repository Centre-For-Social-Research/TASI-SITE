import { MotionItem, MotionReveal, MotionStagger } from "./motion-reveal";

const formatItems = [
  {
    title: "Conversations",
    desc: "Fireside chats, keynote addresses, and curated panels bringing together policymakers, tech leaders, and civil society experts on AI governance and platform accountability.",
  },
  {
    title: "Workshops",
    desc: "Focused workshops and deep-dive sessions exploring real-world case studies, risk mitigation tools, and implementation frameworks.",
  },
  {
    title: "Spotlights",
    desc: "Industry spotlight sessions showcasing emerging tools, research, and innovations addressing online harms, fraud detection, and algorithmic accountability.",
  },
  {
    title: "Receptions",
    desc: "Leadership receptions and networking moments designed to foster meaningful engagement and sustained cross-sector collaboration.",
  },
];

export default function FormatGrid() {
  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Overview
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3.2rem]">
            What to Expect at <span className="text-rc-primary">TASI 2026</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700">
            TASI 2026 blends high-level dialogue with practical exchange so delegates leave with sharper insights,
            stronger networks, and clearer pathways to action.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {formatItems.map((item, index) => (
            <MotionItem key={item.title}>
              <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-lg shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-rc-primary text-sm font-black text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Experience</span>
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-stone-900">{item.title}</h3>
                <p className="mt-4 text-body-md leading-relaxed text-stone-600">{item.desc}</p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
