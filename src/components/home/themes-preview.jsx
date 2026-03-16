import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "./motion-reveal";

const themes = [
  "AI Governance and Regulatory Frameworks",
  "Safety by Design and Platform Accountability",
  "Online Gender Based Violence and Digital Safety",
  "Fraud, Scams and Financial Exploitation",
  "Mental Health and Digital Wellbeing",
  "AI for Inclusive Development",
  "Global South Leadership in AI Governance",
  "Cross Border Digital Harms and Cooperation",
  "Transparency, Risk Assessment and Compliance",
];

export default function ThemesPreview() {
  return (
    <section className="bg-stone-950 py-16 text-white md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <MotionReveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Strategic Focus</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">TASI 2026 Themes</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-stone-300 md:text-lg">
            The festival convenes leaders across government, industry, academia and civil society to examine the most
            urgent questions shaping AI governance and digital trust.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme, index) => (
            <MotionItem key={theme}>
              <article className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-amber-300/50 hover:bg-white/10">
                <p className="text-sm font-semibold text-amber-300">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-bold leading-snug text-white">{theme}</h3>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>

        <MotionReveal className="mt-8 text-center" delay={0.12}>
          <Link
            href="/themes"
            className="inline-flex rounded-md border border-amber-300 px-5 py-3 font-semibold text-amber-200 transition hover:bg-amber-300 hover:text-stone-950"
          >
            Explore All Themes
          </Link>
        </MotionReveal>
      </div>
    </section>
  );
}