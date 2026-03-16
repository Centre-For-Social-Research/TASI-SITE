import { MotionItem, MotionReveal, MotionStagger } from "./motion-reveal";
import CountUpNumber from "../ui/count-up-number";

const stats = [
  { value: 100, suffix: "+", label: "Strategic Conference Speakers" },
  { value: 50, suffix: "+", label: "Strategic Conference Sessions" },
  { value: 3, label: "Strategic Conference Stages" },
];

const formats = [
  {
    title: "01. Keynote Addresses",
    text: "Vision-setting speeches from global leaders shaping AI governance and digital trust across public and private institutions.",
  },
  {
    title: "02. High Level Panels",
    text: "Multi-stakeholder exchanges on trust, safety and platform accountability focused on shared problem solving.",
  },
  {
    title: "03. Fireside Chats",
    text: "Moderated conversations examining practical challenges, implementation risks and forward-looking solutions.",
  },
  {
    title: "04. Policy Roundtables",
    text: "Closed-door discussions that create space for candid regulatory dialogue and cross-sector convergence.",
  },
  {
    title: "05. Industry Spotlights",
    text: "Curated sessions surfacing emerging trust and safety tools, research insights and responsible innovation models.",
  },
  {
    title: "06. Interactive Workshops",
    text: "Hands-on sessions using real case studies so participants leave with frameworks they can apply immediately.",
  },
];

export default function StructureSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <MotionReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Structure</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Convening Format</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600 md:text-lg">
            TASI 2026 is designed as a multi-layered convening that moves from headline policy dialogue into practical,
            implementation-focused exchange.
          </p>
        </MotionReveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <MotionStagger className="grid gap-4 rounded-[28px] border border-stone-200 bg-stone-900 p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
            {stats.map((stat) => (
              <MotionItem key={stat.label}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <CountUpNumber end={stat.value} suffix={stat.suffix || ""} className="text-4xl font-black text-amber-300" />
                  <p className="mt-2 text-sm leading-relaxed text-stone-200">{stat.label}</p>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>

          <MotionStagger className="grid gap-4 md:grid-cols-2">
            {formats.map((item) => (
              <MotionItem key={item.title}>
                <article className="h-full rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-lg font-bold text-stone-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.text}</p>
                </article>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </div>
    </section>
  );
}