import { MotionItem, MotionReveal, MotionStagger } from "./motion-reveal";

const audience = [
  {
    tag: "Policy",
    title: "Government & Regulators",
    text: "Senior officials and regulatory authorities shaping AI governance, digital policy, cybersecurity strategy and platform compliance.",
  },
  {
    tag: "Industry",
    title: "Industry Leaders",
    text: "Delegations from global technology companies, AI developers, platforms and startups working on safety by design and transparency.",
  },
  {
    tag: "Research",
    title: "Civil Society Organisations",
    text: "Digital rights advocates, academic institutions and independent researchers specialising in AI ethics and platform governance.",
  },
  {
    tag: "Global",
    title: "International Delegations",
    text: "Representatives from embassies, multilaterals and development agencies strengthening cross-border cooperation on digital harms.",
  },
];

export default function AudienceSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <MotionReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Audience</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Who Will You Meet?</h2>
        </MotionReveal>

        <MotionStagger className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {audience.map((item) => (
            <MotionItem key={item.title}>
              <article className="h-full rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                  {item.tag}
                </div>
                <h3 className="text-xl font-bold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.text}</p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}