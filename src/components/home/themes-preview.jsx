import Link from 'next/link';
import {
  Accessibility,
  Baby,
  BadgeAlert,
  Bot,
  BriefcaseBusiness,
  Coins,
  FileSearch,
  Globe2,
  HeartHandshake,
  Plane,
  Scale,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { MotionItem, MotionReveal, MotionStagger } from './motion-reveal';
import { themes2026 } from '@/data/themes-2026';

const iconMap = {
  accessibility: Accessibility,
  baby: Baby,
  badgeAlert: BadgeAlert,
  bot: Bot,
  briefcase: BriefcaseBusiness,
  coins: Coins,
  fileSearch: FileSearch,
  globe: Globe2,
  heartHandshake: HeartHandshake,
  plane: Plane,
  scale: Scale,
  shield: Shield,
  shieldAlert: ShieldAlert,
  users: Users,
};

export default function ThemesPreview() {
  return (
    <section className="bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-section-sm text-white md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white md:text-sm">
            Strategic Focus
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem]">
            TASI 2026{' '}
            <span className="text-rc-secondary dark:text-white">Themes</span>
          </h2>
          <p className="mt-5 text-body-lg leading-relaxed text-white/80">
            The festival convenes leaders across government, industry, academia,
            and civil society to examine the urgent questions shaping AI
            governance, platform accountability, digital wellbeing, and trust
            online.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {themes2026.map((theme) => {
            const Icon = iconMap[theme.iconKey];

            return (
              <MotionItem key={theme.num}>
                <Link href="/themes" className="group block h-full">
                  <article className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.08] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.14] md:p-8">
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${theme.accent}`}
                    />
                    <div className="pointer-events-none absolute right-5 top-5 rounded-[10px] border border-white/10 bg-white/10 p-3 text-white/65 backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:text-rc-secondary dark:group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="relative">
                      <p className="text-5xl font-black text-white/15 transition-colors duration-300 group-hover:text-rc-accent dark:group-hover:text-white md:text-6xl">
                        {theme.num}
                      </p>
                      <span
                        className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme.chip}`}
                      >
                        {theme.tag}
                      </span>
                    </div>
                    <h3 className="relative mt-8 max-w-[85%] text-2xl font-bold leading-tight text-white">
                      {theme.title}
                    </h3>
                  </article>
                </Link>
              </MotionItem>
            );
          })}
        </MotionStagger>

        <MotionReveal className="mt-16 text-center md:mt-24" delay={0.12}>
          <Link
            href="/themes"
            className="inline-block rounded-full bg-rc-secondary px-8 py-3 text-sm font-black uppercase tracking-[0.16em] text-rc-primary transition hover:scale-105 hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-[#ffd919]/50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:hover:text-slate-950 md:px-10 md:py-4 md:text-base"
          >
            Explore All Themes
          </Link>
        </MotionReveal>
      </div>
    </section>
  );
}
