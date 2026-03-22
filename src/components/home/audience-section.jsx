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
    <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm text-stone-900 md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Audience
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem]">
            Who Will You <span className="text-rc-primary">Meet?</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700">
            TASI brings together the cross-sector community shaping India&apos;s trust, safety, and AI governance agenda.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {audience.map((item) => (
            <MotionItem key={item.title}>
              <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-lg shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40 md:p-8">
                <div>
                  <div className="mb-6 inline-block rounded-full bg-rc-primary px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                    {item.tag}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-stone-900">{item.title}</h3>
                </div>
                <p className="mt-6 text-body-md leading-relaxed text-stone-600">
                  {item.text}
                </p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
