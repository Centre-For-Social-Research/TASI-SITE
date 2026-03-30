import Link from "next/link";
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
} from "lucide-react";
import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import { themes2026 } from "@/data/themes-2026";

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

export const revalidate = 86400;

export default function ThemesPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="min-h-[320px] py-14 md:min-h-[380px] md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Strategic Focus</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2026
              <span className="block text-rc-secondary dark:text-white">Themes</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              TASI 2026 convenes leaders across government, industry, civil society, and academia to examine urgent
              questions shaping AI governance, digital trust, platform accountability, and safety outcomes.
            </p>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
              <article className="rounded-[10px] border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-black">14</p>
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">Key Themes</p>
              </article>
              <article className="rounded-[10px] border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-black">50+</p>
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">Sessions</p>
              </article>
              <article className="rounded-[10px] border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-black">2</p>
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">Days</p>
              </article>
              <article className="rounded-[10px] border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-black">500+</p>
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">Participants</p>
              </article>
            </div>
          </div>
        </BrandedPageHero>

        <section className="bg-stone-100 py-14 dark:bg-stone-950 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">All Themes</p>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-5xl">What We&apos;ll Examine</h2>
            <p className="mb-8 max-w-3xl text-stone-700 dark:text-slate-300">
              Fourteen interconnected themes spanning governance, platform accountability, digital wellbeing, and human safety, designed to move the conversation from dialogue to implementation.
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {themes2026.map((item) => {
                const Icon = iconMap[item.iconKey];

                return (
                  <article
                    key={item.num}
                    className="group relative overflow-hidden rounded-[10px] border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${item.accent}`} />
                    <div className="pointer-events-none absolute right-4 top-4 rounded-[10px] border border-stone-200/70 bg-white/90 p-3 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
                      <Icon className="h-6 w-6 text-stone-500 transition duration-300 group-hover:scale-110 group-hover:text-stone-800 dark:text-slate-400 dark:group-hover:text-white" />
                    </div>
                    <div className="relative mb-5 flex items-center justify-between pr-16">
                      <span className="text-4xl font-black text-stone-200 dark:text-slate-700">{item.num}</span>
                    </div>
                    <h3 className="relative mb-2 pr-16 text-lg font-bold text-stone-900 dark:text-white">{item.title}</h3>
                    <p className="relative mb-4 text-sm leading-6 text-stone-700 dark:text-slate-300">{item.desc}</p>
                    <span className={`relative inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.chip}`}>
                      {item.tag}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 dark:bg-stone-950">
          <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">Be Part of the Conversation</h2>
            <Link href="/register" className="inline-flex rounded-md bg-orange-700 px-6 py-3 font-semibold text-white hover:bg-orange-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              Register for TASI 2026
            </Link>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
