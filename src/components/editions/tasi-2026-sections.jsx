import Image from 'next/image';
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

import CountUpNumber from '@/components/ui/count-up-number';
import {
  MotionItem,
  MotionReveal,
  MotionStagger,
} from '@/components/ui/motion-reveal';
import {
  tasi2026AudienceSegments,
  tasi2026FormatItems,
  tasi2026StructureFormats,
  tasi2026StructureStats,
} from '@/data/tasi-2026-edition';
import { themes2026 } from '@/data/themes-2026';

const themeIconMap = {
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

export function Tasi2026FormatSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Overview
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
            What to Expect at{' '}
            <span className="text-rc-primary dark:text-white">TASI 2026</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            TASI 2026 blends high-level dialogue with practical exchange so
            delegates leave with sharper insights, stronger networks, and
            clearer pathways to action.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tasi2026FormatItems.map((item, index) => (
            <MotionItem key={item.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[1.5/1] w-full">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className={`object-cover transition-transform duration-500 ${item.imageClassName || ''}`}
                    sizes="(min-width: 1280px) 23vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="flex h-full flex-col p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rc-primary text-sm font-black text-white dark:bg-white dark:text-slate-950">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400 dark:text-slate-500">
                      Experience
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-stone-900 dark:text-white md:text-[1.35rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                    {item.desc}
                  </p>
                </div>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}

export function Tasi2026StructureSection() {
  return (
    <section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
            Structure
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.2rem]">
            Convening{' '}
            <span className="text-rc-primary dark:text-white">Format</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            TASI 2026 is designed as a multi-layered convening that moves from
            headline policy dialogue into practical, implementation-focused
            exchange, carrying delegates from vision into execution.
          </p>
        </MotionReveal>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <MotionStagger className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
            {tasi2026StructureStats.map((stat) => (
              <MotionItem key={stat.label}>
                <div className="flex h-full flex-col justify-center rounded-[10px] bg-[linear-gradient(145deg,#350265_0%,#4a0c7f_100%)] p-6 text-left shadow-xl shadow-[#350265]/20 transition-transform duration-300 hover:-translate-y-1 md:p-8">
                  <CountUpNumber
                    end={stat.value}
                    suffix={stat.suffix || ''}
                    className="text-5xl font-black text-rc-secondary dark:text-white md:text-6xl"
                  />
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-white/80">
                    {stat.label}
                  </p>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>

          <MotionStagger className="grid w-full gap-6 md:grid-cols-2">
            {tasi2026StructureFormats.map((item) => (
              <MotionItem key={item.title}>
                <article className="h-full rounded-[10px] border border-stone-200 bg-stone-50/70 p-7 shadow-lg shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-8">
                  <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="mt-5 h-1 w-14 rounded-full bg-rc-accent dark:bg-white" />
                  <p className="mt-5 text-body-md leading-relaxed text-stone-600 dark:text-slate-300">
                    {item.text}
                  </p>
                </article>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </div>
    </section>
  );
}

export function Tasi2026ThemesSection() {
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
            const Icon = themeIconMap[theme.iconKey];

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

export function Tasi2026AudienceSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] dark:text-stone-100 md:py-section-lg">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 lg:px-16">
        <MotionReveal className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent md:text-sm">
            Audience
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem]">
            Who Will You{' '}
            <span className="text-rc-primary dark:text-white">Meet?</span>
          </h2>
          <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
            TASI brings together the cross-sector community shaping India&apos;s
            trust, safety, and AI governance agenda.
          </p>
        </MotionReveal>

        <MotionStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tasi2026AudienceSegments.map((item) => (
            <MotionItem key={item.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-lg shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[1.5/1] w-full">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 23vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="flex h-full flex-col p-5 md:p-6">
                  <div className="inline-block rounded-[10px] bg-rc-primary px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white dark:bg-white dark:text-slate-950">
                    {item.tag}
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-stone-900 dark:text-white md:text-[1.35rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                    {item.text}
                  </p>
                </div>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
