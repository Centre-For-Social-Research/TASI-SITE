import { MotionItem, MotionReveal, MotionStagger } from "./motion-reveal";

const formatItems = [
  {
    title: "Conversations",
    desc: "Fireside chats and keynotes connecting policymakers, platforms, and civil society on governance and accountability.",
  },
  {
    title: "Workshops",
    desc: "Focused deep-dive sessions with case studies, tools, and practical implementation frameworks.",
  },
  {
    title: "Spotlights",
    desc: "Emerging innovations in online safety, moderation quality, and fraud prevention.",
  },
  {
    title: "Receptions",
    desc: "Leadership networking moments designed to build sustained cross-sector collaboration.",
  },
];

export default function FormatGrid() {
  return (
    <section className="bg-stone-100 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <MotionReveal>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Format</p>
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-stone-900 md:text-5xl">What to Expect at TASI 2026</h2>
        </MotionReveal>

        <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {formatItems.map((item) => (
            <MotionItem key={item.title}>
              <article className="rounded-2xl border border-stone-200 bg-white p-5">
                <h3 className="mb-2 text-xl font-bold text-stone-900">{item.title}</h3>
                <p className="text-sm text-stone-700">{item.desc}</p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
