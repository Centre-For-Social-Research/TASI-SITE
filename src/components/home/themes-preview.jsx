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
    <section className="bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-section-sm text-white md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-secondary md:text-sm">
            Strategic Focus
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem]">
            TASI 2026 <span className="text-rc-secondary">Themes</span>
          </h2>
          <p className="mt-5 text-body-lg leading-relaxed text-white/80">
            The festival convenes leaders across government, industry, academia, and civil society to examine the
            urgent questions shaping AI governance and digital trust.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, index) => (
            <MotionItem key={theme}>
              <Link href="/themes" className="group block h-full">
                <article className="flex h-full min-h-[220px] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.08] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.14] md:p-8">
                  <p className="text-5xl font-black text-white/15 transition-colors duration-300 group-hover:text-rc-accent md:text-6xl">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-8 text-2xl font-bold leading-tight text-white">
                    {theme}
                  </h3>
                </article>
              </Link>
            </MotionItem>
          ))}
        </MotionStagger>

        <MotionReveal className="mt-16 text-center md:mt-24" delay={0.12}>
          <Link
            href="/themes"
            className="inline-block rounded-full bg-rc-secondary px-8 py-3 text-sm font-black uppercase tracking-[0.16em] text-rc-primary transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#ffd919]/50 md:px-10 md:py-4 md:text-base"
          >
            Explore All Themes
          </Link>
        </MotionReveal>
      </div>
    </section>
  );
}
