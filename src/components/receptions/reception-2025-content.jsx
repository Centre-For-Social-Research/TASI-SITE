'use client';

import Image from 'next/image';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';

import {
  MotionItem,
  MotionReveal,
  MotionStagger,
} from '@/components/ui/motion-reveal';
import { receptionStats, receptions } from '@/data/receptions';

import { ReceptionOverviewCard, ReceptionSpeakerBadge } from './reception-ui';

const receptionMomentum = [
  'Embassy-hosted conversations gave the festival a stronger diplomatic frame.',
  'The reception arc linked pre-launch relationship building to day-one collaboration and day-two future planning.',
  'Women-led safety-by-design voices and cross-border experts gave the page a distinct editorial identity.',
  'The closing evening naturally points toward TASI 2026 and the wider AI Impact Summit agenda.',
];

function ReceptionStatsGrid() {
  return (
    <MotionStagger className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {receptionStats.map((item) => (
        <MotionItem key={item.label}>
          <article className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
            <p className="text-4xl font-black tracking-tight text-rc-primary dark:text-amber-300">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
              {item.label}
            </p>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}

function ReceptionDetailSection({ reception, index }) {
  return (
    <MotionReveal delay={index * 0.04}>
      <section
        id={reception.slug}
        className="overflow-hidden rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_100%)] shadow-xl shadow-stone-200/40 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
      >
        <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rc-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                {reception.accentLabel}
              </span>
              <span className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-600 dark:border-slate-700 dark:text-slate-300">
                {reception.networkingWindow}
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl">
              {reception.title}
            </h2>
            <p className="mt-3 text-xl font-semibold leading-relaxed text-stone-700 dark:text-slate-200">
              {reception.theme}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 dark:border-slate-700">
                <CalendarDays className="h-4 w-4" />
                {reception.date}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 dark:border-slate-700">
                <MapPin className="h-4 w-4" />
                {reception.venue}
              </span>
            </div>

            <p className="mt-7 text-body-lg leading-relaxed text-stone-700 dark:text-slate-300">
              {reception.summary}
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-[10px] border border-stone-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-[#fff] dark:border-slate-700">
                <Image
                  src={reception.hostLogo}
                  alt={reception.hostEmbassy}
                  fill
                  className="scale-[1.2] object-contain object-center p-2"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-amber-300">
                  Host Embassy
                </p>
                <p className="mt-2 text-lg font-bold text-stone-900 dark:text-white">
                  {reception.hostEmbassy}
                </p>
                <p className="text-sm text-stone-500 dark:text-slate-400">
                  Diplomatic partner for this reception evening
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-1">
            {reception.gallery.map((image, imageIndex) => (
              <div key={image} className="relative min-h-[220px]">
                <Image
                  src={image}
                  alt={`${reception.title} gallery image ${imageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 35vw, (min-width: 640px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-200 bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_100%)] p-6 text-white dark:border-slate-800 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary">
            Speakers and key voices
          </p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            All speakers in this reception
          </h3>
          <MotionStagger className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reception.featuredPeople.map((person) => (
              <MotionItem key={`${reception.slug}-${person.name}`}>
                <ReceptionSpeakerBadge person={person} />
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </section>
    </MotionReveal>
  );
}

export default function Reception2025Content() {
  return (
    <>
      <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] py-section-sm dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] md:py-section-lg">
        <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
          <MotionReveal className="max-w-3xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-amber-300 md:text-sm">
              Reception Overview
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-5xl lg:text-[3.1rem]">
              Three embassy evenings that extended the festival beyond the
              conference floor
            </h2>
            <p className="mt-5 text-body-lg text-stone-700 dark:text-slate-300">
              Each reception carried its own diplomatic tone, from pre-launch
              welcome to a women-led safety-by-design conversation and a
              forward-looking closing dialogue.
            </p>
          </MotionReveal>

          <ReceptionStatsGrid />

          <MotionStagger className="mt-12 grid gap-6 xl:grid-cols-3">
            {receptions.map((reception) => (
              <MotionItem key={reception.slug}>
                <ReceptionOverviewCard reception={reception} />
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      <section className="bg-white py-section-sm dark:bg-stone-950 md:py-section-lg">
        <div className="mx-auto w-full max-w-[1300px] px-4 md:px-8 lg:px-16">
          <div className="space-y-10">
            {receptions.map((reception, index) => (
              <ReceptionDetailSection
                key={reception.slug}
                reception={reception}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(120deg,#1b1035_0%,#3b0e5b_45%,#7a1e63_100%)] py-section-sm text-white md:py-section-lg">
        <div className="mx-auto grid w-full max-w-[1300px] gap-8 px-4 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
          <MotionReveal>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary">
              Closing momentum
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.1rem]">
              From reception diplomacy to the road ahead for AI safety
            </h2>
            <p className="mt-5 text-body-lg leading-relaxed text-white/80">
              Across three evenings, TASI 2025 demonstrated that trust and
              safety leadership grows stronger when policymakers, embassies,
              civil society, and innovators gather in smaller rooms built for
              exchange, not just speeches.
            </p>
          </MotionReveal>

          <MotionStagger className="grid gap-4">
            {receptionMomentum.map((point) => (
              <MotionItem key={point}>
                <article className="rounded-[10px] border border-white/10 bg-white/[0.08] p-5 backdrop-blur-sm">
                  <p className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-none text-rc-secondary" />
                    <span>{point}</span>
                  </p>
                </article>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </section>
    </>
  );
}
