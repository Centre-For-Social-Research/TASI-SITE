'use client';

import Image from 'next/image';
import { CalendarDays, Lock, MapPin, MoveRight } from 'lucide-react';

import {
  MotionItem,
  MotionReveal,
  MotionStagger,
} from '@/components/ui/motion-reveal';

export function ReceptionSpeakerBadge({ person }) {
  return (
    <article className="rounded-[10px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full border border-white/10 bg-white/10">
          {person.photo ? (
            <Image
              src={person.photo}
              alt={person.name}
              fill
              className="scale-[1.14] object-cover object-center"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
              TASI
            </div>
          )}
        </div>
        <div className="min-h-[4.75rem] min-w-0">
          <h3 className="truncate text-base font-bold text-white">
            {person.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/70">
            {person.role}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ReceptionOverviewCard({ reception }) {
  const hostLogos = reception.hostLogos || [
    { logo: reception.hostLogo, name: reception.hostEmbassy },
  ];

  return (
    <article className="flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-amber-300">
              {reception.shortDate}
            </p>
            {reception.access ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-600 dark:border-slate-700 dark:text-slate-300">
                <Lock className="h-3 w-3" />
                {reception.access}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            {reception.title}
          </h3>
        </div>
        <div className="flex flex-none -space-x-3">
          {hostLogos.map((host) => (
            <div
              key={host.name}
              className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-[#fff] dark:border-slate-700"
            >
              <Image
                src={host.logo}
                alt={host.name}
                fill
                className="scale-[1.2] object-contain object-center p-1.5"
                sizes="48px"
              />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 text-base font-semibold leading-relaxed text-stone-800 dark:text-slate-100">
        {reception.theme}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
        {reception.venue}
      </p>
      <p className="mt-5 flex-1 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
        {reception.summary}
      </p>
      {reception.agendaDownload ? (
        <a
          href={reception.agendaDownload}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-stone-700 transition hover:text-rc-primary dark:text-slate-200 dark:hover:text-amber-300"
        >
          Download agenda
        </a>
      ) : null}
      <a
        href={`#${reception.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-rc-primary dark:text-amber-300"
      >
        Explore reception
        <MoveRight className="h-4 w-4" />
      </a>
    </article>
  );
}

export function ReceptionDetailSection({ reception, index = 0 }) {
  const hosts = reception.hosts || [
    { logo: reception.hostLogo, name: reception.hostEmbassy },
  ];

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

            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-[10px] border border-stone-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-none gap-2">
                {hosts.map((host) => (
                  <div
                    key={host.name}
                    className={
                      hosts.length > 1
                        ? 'relative h-16 w-28 overflow-hidden rounded-[10px] border border-stone-200 bg-[#fff] dark:border-slate-700'
                        : 'relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-[#fff] dark:border-slate-700'
                    }
                  >
                    <Image
                      src={host.logo}
                      alt={host.name}
                      fill
                      className={
                        hosts.length > 1
                          ? 'object-contain p-1.5'
                          : 'scale-[1.2] object-contain object-center p-2'
                      }
                      sizes={hosts.length > 1 ? '112px' : '64px'}
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-amber-300">
                  {hosts.length > 1 ? 'Host Embassies' : 'Host Embassy'}
                </p>
                <p className="mt-2 text-lg font-bold text-stone-900 dark:text-white">
                  {hosts.map((host) => host.name).join(' and ')}
                </p>
                <p className="text-sm text-stone-500 dark:text-slate-400">
                  {hosts.length > 1
                    ? 'Diplomatic partners for this reception evening'
                    : 'Diplomatic partner for this reception evening'}
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

        {reception.moreGallery?.length ? (
          <div className="grid grid-cols-2 gap-0 border-t border-stone-200 dark:border-slate-800 md:grid-cols-3">
            {reception.moreGallery.map((image, imageIndex) => (
              <div key={image} className="relative aspect-[3/2]">
                <Image
                  src={image}
                  alt={`${reception.title} gallery image ${reception.gallery.length + imageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
              </div>
            ))}
          </div>
        ) : null}

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
